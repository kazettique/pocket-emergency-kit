package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const defaultOverpassEndpoint = "https://overpass-api.de/api/interpreter"

// OsmElement is the subset of an Overpass element we care about. Both `node`
// and `way` types appear. For ways we rely on `out center;` which attaches the
// centroid at the top level as `center`, so we collapse it into lat/lon when
// decoding.
type OsmElement struct {
	Type string            `json:"type"`
	ID   int64             `json:"id"`
	Lat  float64           `json:"-"`
	Lon  float64           `json:"-"`
	Tags map[string]string `json:"tags"`
}

type overpassResponse struct {
	Elements []rawElement `json:"elements"`
}

type rawElement struct {
	Type   string            `json:"type"`
	ID     int64             `json:"id"`
	Lat    float64           `json:"lat"`
	Lon    float64           `json:"lon"`
	Center *rawCenter        `json:"center,omitempty"`
	Tags   map[string]string `json:"tags,omitempty"`
}

type rawCenter struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}

// FetchShelters runs a single Overpass QL query for the given bbox and
// returns every matching element with a resolvable lat/lon.
// bbox is [minLat, minLng, maxLat, maxLng] — Overpass order.
func FetchShelters(ctx context.Context, endpoint string, bbox [4]float64) ([]OsmElement, error) {
	if endpoint == "" {
		endpoint = defaultOverpassEndpoint
	}

	ql := fmt.Sprintf(`[timeout:60][out:json];
(
  node["emergency"="assembly_point"](%f,%f,%f,%f);
  way["emergency"="assembly_point"](%f,%f,%f,%f);
  node["amenity"="shelter"](%f,%f,%f,%f);
  way["amenity"="shelter"](%f,%f,%f,%f);
);
out center tags;`,
		bbox[0], bbox[1], bbox[2], bbox[3],
		bbox[0], bbox[1], bbox[2], bbox[3],
		bbox[0], bbox[1], bbox[2], bbox[3],
		bbox[0], bbox[1], bbox[2], bbox[3],
	)

	form := url.Values{}
	form.Set("data", ql)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("User-Agent", "pocket-emergency-kit-importer/0.1 (https://github.com/eukaryaio/pocket-emergency-kit)")

	client := &http.Client{Timeout: 90 * time.Second}

	var body []byte
	for attempt := 1; attempt <= 3; attempt++ {
		resp, err := client.Do(req)
		if err != nil {
			if attempt == 3 {
				return nil, fmt.Errorf("overpass request: %w", err)
			}
			time.Sleep(time.Duration(attempt) * 2 * time.Second)
			continue
		}
		body, _ = io.ReadAll(resp.Body)
		_ = resp.Body.Close()

		if resp.StatusCode == http.StatusOK {
			break
		}
		if resp.StatusCode == 429 || resp.StatusCode >= 500 {
			if attempt == 3 {
				return nil, fmt.Errorf("overpass status %d after %d attempts: %s", resp.StatusCode, attempt, truncate(string(body), 200))
			}
			wait := time.Duration(attempt*attempt) * 5 * time.Second
			time.Sleep(wait)
			continue
		}
		return nil, fmt.Errorf("overpass status %d: %s", resp.StatusCode, truncate(string(body), 200))
	}

	var parsed overpassResponse
	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil, fmt.Errorf("decode overpass response: %w (body: %s)", err, truncate(string(body), 200))
	}

	out := make([]OsmElement, 0, len(parsed.Elements))
	for _, r := range parsed.Elements {
		lat, lon := r.Lat, r.Lon
		if (lat == 0 && lon == 0) && r.Center != nil {
			lat, lon = r.Center.Lat, r.Center.Lon
		}
		if lat == 0 && lon == 0 {
			continue // drop elements with no resolvable coords
		}
		out = append(out, OsmElement{
			Type: r.Type,
			ID:   r.ID,
			Lat:  lat,
			Lon:  lon,
			Tags: r.Tags,
		})
	}
	return out, nil
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "…"
}

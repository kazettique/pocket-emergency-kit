package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"
)

// Default bbox covers the Tokyo 23 wards. Overpass expects [minLat, minLng,
// maxLat, maxLng].
var defaultBBox = [4]float64{35.50, 139.58, 35.83, 139.92}

const writeRateMs = 200

func main() {
	dryRun := flag.Bool("dry-run", false, "Transform and print payloads without writing to CMS")
	limit := flag.Int("limit", 0, "Cap on writes (0 = no cap). With --dry-run, caps printed payloads to this number.")
	flag.Parse()

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	bbox, err := loadBBox(os.Getenv("IMPORT_BBOX"))
	if err != nil {
		log.Fatalf("IMPORT_BBOX: %v", err)
	}
	endpoint := os.Getenv("OVERPASS_ENDPOINT")

	var cms *CMSClient
	if !*dryRun {
		required := map[string]string{
			"CMS_API_URL":           os.Getenv("CMS_API_URL"),
			"CMS_WORKSPACE":         os.Getenv("CMS_WORKSPACE"),
			"CMS_PROJECT":           os.Getenv("CMS_PROJECT"),
			"CMS_EVAC_MODEL_KEY":    os.Getenv("CMS_EVAC_MODEL_KEY"),
			"CMS_INTEGRATION_TOKEN": os.Getenv("CMS_INTEGRATION_TOKEN"),
		}
		missing := []string{}
		for k, v := range required {
			if v == "" {
				missing = append(missing, k)
			}
		}
		if len(missing) > 0 {
			log.Fatalf("missing env vars: %s", strings.Join(missing, ", "))
		}
		cms = NewCMSClient(
			required["CMS_API_URL"],
			required["CMS_WORKSPACE"],
			required["CMS_PROJECT"],
			required["CMS_EVAC_MODEL_KEY"],
			required["CMS_INTEGRATION_TOKEN"],
		)
	}

	seen := map[string]struct{}{}
	if !*dryRun {
		log.Println("listing existing items for dedup...")
		s, err := cms.ListSourceIDs(ctx)
		if err != nil {
			log.Fatalf("list existing items: %v", err)
		}
		seen = s
		log.Printf("  %d existing source_ids", len(seen))
	}

	log.Println("fetching Overpass shelters for bbox", bbox, "...")
	elements, err := FetchShelters(ctx, endpoint, bbox)
	if err != nil {
		log.Fatalf("overpass: %v", err)
	}
	log.Printf("  %d elements returned", len(elements))

	now := time.Now()

	stats := struct {
		fetched int
		created int
		skipped int
		errors  int
		printed int
	}{fetched: len(elements)}

	for _, el := range elements {
		sourceID := fmt.Sprintf("osm:%s/%d", el.Type, el.ID)
		if _, dup := seen[sourceID]; dup {
			stats.skipped++
			continue
		}

		fields := elementToFields(el, now)

		if *dryRun {
			if *limit > 0 && stats.printed >= *limit {
				continue
			}
			printPayload(fields)
			stats.printed++
			continue
		}

		if *limit > 0 && stats.created >= *limit {
			break
		}

		if _, err := cms.CreateItem(ctx, fields); err != nil {
			log.Printf("create %s: %v", sourceID, err)
			stats.errors++
		} else {
			stats.created++
			seen[sourceID] = struct{}{}
		}

		select {
		case <-ctx.Done():
			log.Println("cancelled")
			break
		case <-time.After(writeRateMs * time.Millisecond):
		}
	}

	log.Println("---")
	log.Printf("fetched: %d", stats.fetched)
	if *dryRun {
		log.Printf("printed: %d (skipped %d already in CMS)", stats.printed, stats.skipped)
	} else {
		log.Printf("created: %d", stats.created)
		log.Printf("skipped (dedup): %d", stats.skipped)
		log.Printf("errors:  %d", stats.errors)
	}
}

func loadBBox(raw string) ([4]float64, error) {
	if raw == "" {
		return defaultBBox, nil
	}
	parts := strings.Split(raw, ",")
	if len(parts) != 4 {
		return [4]float64{}, fmt.Errorf("expected 4 comma-separated numbers (minLng,minLat,maxLng,maxLat), got %q", raw)
	}
	nums := [4]float64{}
	for i, p := range parts {
		v, err := strconv.ParseFloat(strings.TrimSpace(p), 64)
		if err != nil {
			return [4]float64{}, fmt.Errorf("parse bbox[%d]=%q: %w", i, p, err)
		}
		nums[i] = v
	}
	// IMPORT_BBOX is given in lng/lat order but Overpass expects lat/lng.
	return [4]float64{nums[1], nums[0], nums[3], nums[2]}, nil
}

func printPayload(fields []Field) {
	buf, _ := json.MarshalIndent(map[string]interface{}{
		"fields":         fields,
		"metadataFields": []interface{}{},
	}, "", "  ")
	fmt.Println(string(buf))
	fmt.Println()
}

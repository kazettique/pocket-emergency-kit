package main

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

// Payload `type` strings. If the CMS version on your instance uses different
// tokens (e.g. `geometry` instead of `geometryObject`), change them here.
const (
	typeText           = "text"
	typeTextArea       = "textArea"
	typeInteger        = "integer"
	typeBool           = "bool"
	typeDate           = "date"
	typeSelect         = "select"
	typeGeometryObject = "geometryObject"
)

// elementToFields maps one OSM element to the list of CMS item fields we POST.
// Missing optional fields are omitted entirely rather than sent as empty —
// cleaner payloads, less surface area for type mismatches.
func elementToFields(el OsmElement, now time.Time) []Field {
	tags := el.Tags
	fields := []Field{}

	// name (required — fall back if missing)
	name := firstNonEmpty(tags["name:ja"], tags["name"])
	if name == "" {
		name = fmt.Sprintf("osm-%s-%d", el.Type, el.ID)
	}
	fields = append(fields, Field{Key: "name", Type: typeText, Value: name})

	if en := tags["name:en"]; en != "" {
		fields = append(fields, Field{Key: "name_en", Type: typeText, Value: en})
	}

	fields = append(fields, Field{
		Key:  "location",
		Type: typeGeometryObject,
		Value: map[string]interface{}{
			"type":        "Point",
			"coordinates": []float64{el.Lon, el.Lat},
		},
	})

	if addr := deriveAddress(tags); addr != "" {
		fields = append(fields, Field{Key: "address", Type: typeText, Value: addr})
	}

	cap := 0
	if s := tags["capacity"]; s != "" {
		if n, err := strconv.Atoi(s); err == nil {
			cap = n
		}
	}
	fields = append(fields, Field{Key: "capacity", Type: typeInteger, Value: cap})

	fields = append(fields, Field{Key: "disaster_types", Type: typeSelect, Value: deriveDisasterTypes(tags)})

	accessible := tags["wheelchair"] == "yes"
	fields = append(fields, Field{Key: "accessible", Type: typeBool, Value: accessible})

	pets := tags["dog"] == "yes" || tags["animal:pet"] == "yes"
	fields = append(fields, Field{Key: "accepts_pets", Type: typeBool, Value: pets})

	if note := firstNonEmpty(tags["note"], tags["description"]); note != "" {
		fields = append(fields, Field{Key: "notes", Type: typeTextArea, Value: note})
	}

	fields = append(fields, Field{
		Key:   "source_id",
		Type:  typeText,
		Value: fmt.Sprintf("osm:%s/%d", el.Type, el.ID),
	})

	fields = append(fields, Field{
		Key:   "verified_at",
		Type:  typeDate,
		Value: now.UTC().Format(time.RFC3339),
	})

	return fields
}

func firstNonEmpty(vs ...string) string {
	for _, v := range vs {
		if v != "" {
			return v
		}
	}
	return ""
}

func deriveAddress(tags map[string]string) string {
	if full := tags["addr:full"]; full != "" {
		return full
	}
	parts := []string{}
	for _, k := range []string{"addr:province", "addr:city", "addr:suburb", "addr:neighbourhood", "addr:block_number", "addr:housenumber"} {
		if v := tags[k]; v != "" {
			parts = append(parts, v)
		}
	}
	return strings.Join(parts, " ")
}

// deriveDisasterTypes maps OSM shelter tags to our PWA's DisasterType enum.
// Always returns at least one value so the multi-select `select` field never
// ships an empty array (the CMS may reject that).
func deriveDisasterTypes(tags map[string]string) []string {
	set := map[string]struct{}{}

	// Primary role hints
	switch {
	case tags["emergency"] == "assembly_point":
		set["earthquake"] = struct{}{}
	case tags["amenity"] == "shelter":
		switch tags["shelter_type"] {
		case "rescue", "":
			set["earthquake"] = struct{}{}
		case "weather", "storm":
			set["typhoon"] = struct{}{}
		case "avalanche_rescue":
			set["landslide"] = struct{}{}
		}
	}

	// Sub-tag hints that may appear alongside the role
	if tags["tsunami"] == "yes" || tags["emergency"] == "tsunami_shelter" {
		set["tsunami"] = struct{}{}
	}
	if tags["flood_shelter"] == "yes" || tags["disaster:flood"] == "yes" {
		set["flood"] = struct{}{}
	}
	if tags["disaster:earthquake"] == "yes" {
		set["earthquake"] = struct{}{}
	}
	if tags["disaster:typhoon"] == "yes" {
		set["typhoon"] = struct{}{}
	}
	if tags["disaster:landslide"] == "yes" {
		set["landslide"] = struct{}{}
	}
	if tags["disaster:fire"] == "yes" {
		set["fire"] = struct{}{}
	}
	if tags["disaster:storm_surge"] == "yes" {
		set["storm_surge"] = struct{}{}
	}
	if tags["disaster:heatwave"] == "yes" {
		set["heatwave"] = struct{}{}
	}

	if len(set) == 0 {
		set["earthquake"] = struct{}{}
	}

	out := make([]string, 0, len(set))
	// Stable order so dry-run payloads are easy to diff
	for _, k := range []string{"earthquake", "flood", "tsunami", "fire", "landslide", "storm_surge", "typhoon", "heatwave"} {
		if _, ok := set[k]; ok {
			out = append(out, k)
		}
	}
	return out
}

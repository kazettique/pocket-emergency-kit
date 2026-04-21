package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"
)

// SeedSpec bundles everything needed to seed one CMS model: the env-var
// holding its model key, the natural-key field used for dedup, and a
// producer that yields (dedupValue, fields) pairs.
type SeedSpec struct {
	Model        string
	ModelKeyEnv  string
	DedupField   string
	Count        int
	Iter         func(i int) (dedupValue string, fields []Field)
}

var seedSpecs = map[string]SeedSpec{
	"guide_article":     guideArticleSpec(),
	"checklist_item":    checklistItemSpec(),
	"emergency_contact": emergencyContactSpec(),
	"area_annotation":   areaAnnotationSpec(),
}

func runSeed(ctx context.Context, args []string) {
	if len(args) == 0 {
		log.Fatalf("usage: importer seed <model> [--dry-run] [--limit N]\n  models: %s", strings.Join(seedModelNames(), ", "))
	}
	model := args[0]
	spec, ok := seedSpecs[model]
	if !ok {
		log.Fatalf("unknown model %q. known: %s", model, strings.Join(seedModelNames(), ", "))
	}
	rest := args[1:]
	// Minimal inline flag parsing, consistent with evac subcommand style.
	dryRun := false
	limit := 0
	for i := 0; i < len(rest); i++ {
		switch rest[i] {
		case "--dry-run":
			dryRun = true
		case "--limit":
			if i+1 >= len(rest) {
				log.Fatalf("--limit requires a value")
			}
			var n int
			if _, err := fmt.Sscanf(rest[i+1], "%d", &n); err != nil {
				log.Fatalf("--limit: %v", err)
			}
			limit = n
			i++
		default:
			log.Fatalf("unknown flag %q", rest[i])
		}
	}

	var cms *CMSClient
	if !dryRun {
		modelKey := os.Getenv(spec.ModelKeyEnv)
		if modelKey == "" {
			// Fall back to the model name itself; most projects use the key
			// as the slug.
			modelKey = spec.Model
		}
		required := map[string]string{
			"CMS_API_URL":           os.Getenv("CMS_API_URL"),
			"CMS_WORKSPACE":         os.Getenv("CMS_WORKSPACE"),
			"CMS_PROJECT":           os.Getenv("CMS_PROJECT"),
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
			modelKey,
			required["CMS_INTEGRATION_TOKEN"],
		)
	}

	seen := map[string]struct{}{}
	if !dryRun {
		log.Printf("listing existing %s for dedup (on field %q)...", spec.Model, spec.DedupField)
		s, err := cms.ListFieldValues(ctx, spec.DedupField)
		if err != nil {
			log.Fatalf("list existing items: %v", err)
		}
		seen = s
		log.Printf("  %d existing %s values", len(seen), spec.DedupField)
	}

	stats := struct {
		created int
		skipped int
		errors  int
		printed int
	}{}

	for i := 0; i < spec.Count; i++ {
		dedupValue, fields := spec.Iter(i)
		if _, dup := seen[dedupValue]; dup {
			stats.skipped++
			continue
		}
		if dryRun {
			if limit > 0 && stats.printed >= limit {
				continue
			}
			printPayload(fields)
			stats.printed++
			continue
		}
		if limit > 0 && stats.created >= limit {
			break
		}
		if _, err := cms.CreateItem(ctx, fields); err != nil {
			log.Printf("create %s=%q: %v", spec.DedupField, dedupValue, err)
			stats.errors++
		} else {
			stats.created++
			seen[dedupValue] = struct{}{}
		}
		select {
		case <-ctx.Done():
			log.Println("cancelled")
			return
		case <-time.After(writeRateMs * time.Millisecond):
		}
	}

	log.Println("---")
	log.Printf("model:   %s", spec.Model)
	log.Printf("total:   %d", spec.Count)
	if dryRun {
		log.Printf("printed: %d (skipped %d dedup)", stats.printed, stats.skipped)
	} else {
		log.Printf("created: %d", stats.created)
		log.Printf("skipped (dedup): %d", stats.skipped)
		log.Printf("errors:  %d", stats.errors)
	}
}

func seedModelNames() []string {
	out := make([]string, 0, len(seedSpecs))
	for k := range seedSpecs {
		out = append(out, k)
	}
	return out
}

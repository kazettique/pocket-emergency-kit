package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// Field is one entry in the CMS item `fields` array.
type Field struct {
	Key   string      `json:"key"`
	Type  string      `json:"type"`
	Value interface{} `json:"value"`
}

// ItemPayload is the body of POST /items.
type ItemPayload struct {
	Fields         []Field  `json:"fields"`
	MetadataFields []string `json:"metadataFields"`
}

// CMSClient talks to the Re:Earth integration API.
// The integration API lives on its own hostname (e.g. api.cms.test.reearth.dev),
// separate from the UI / public-read host.
type CMSClient struct {
	APIURL    string // e.g. https://api.cms.test.reearth.dev
	Workspace string // workspace ID or alias
	Project   string // project alias
	ModelKey  string
	Token     string

	http *http.Client
}

func NewCMSClient(apiURL, workspace, project, modelKey, token string) *CMSClient {
	return &CMSClient{
		APIURL:    strings.TrimRight(apiURL, "/"),
		Workspace: workspace,
		Project:   project,
		ModelKey:  modelKey,
		Token:     token,
		http:      &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *CMSClient) itemsURL() string {
	return fmt.Sprintf("%s/api/%s/projects/%s/models/%s/items",
		c.APIURL,
		url.PathEscape(c.Workspace),
		url.PathEscape(c.Project),
		url.PathEscape(c.ModelKey),
	)
}

// listResponse matches the integration API's paginated list envelope.
// The "items" array contains objects with at least "id" and "fields".
type listResponse struct {
	Items      []rawItem `json:"items"`
	TotalCount int       `json:"totalCount"`
	Page       int       `json:"page"`
	PerPage    int       `json:"perPage"`
}

type rawItem struct {
	ID     string  `json:"id"`
	Fields []Field `json:"fields"`
}

// ListFieldValues pages through every item in the model and returns the set
// of values on the given field key. Used for dedup: evac-site import keys on
// `source_id`; seed imports key on the natural title/label field of each
// model.
func (c *CMSClient) ListFieldValues(ctx context.Context, fieldKey string) (map[string]struct{}, error) {
	seen := make(map[string]struct{})
	page := 1
	const perPage = 100
	for {
		u := fmt.Sprintf("%s?page=%d&perPage=%d", c.itemsURL(), page, perPage)
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
		if err != nil {
			return nil, err
		}
		req.Header.Set("Authorization", "Bearer "+c.Token)
		req.Header.Set("Accept", "application/json")

		body, status, err := c.doWithRetry(req)
		if err != nil {
			return nil, err
		}
		if status != http.StatusOK {
			return nil, fmt.Errorf("list items: status %d: %s", status, truncate(string(body), 200))
		}
		var parsed listResponse
		if err := json.Unmarshal(body, &parsed); err != nil {
			return nil, fmt.Errorf("decode list response: %w (body: %s)", err, truncate(string(body), 200))
		}
		for _, it := range parsed.Items {
			for _, f := range it.Fields {
				if f.Key == fieldKey {
					if s, ok := f.Value.(string); ok && s != "" {
						seen[s] = struct{}{}
					}
				}
			}
		}
		if len(parsed.Items) < perPage || page*perPage >= parsed.TotalCount {
			break
		}
		page++
	}
	return seen, nil
}

// CreateItem POSTs one item. Returns the CMS-assigned item ID on success.
func (c *CMSClient) CreateItem(ctx context.Context, fields []Field) (string, error) {
	body, err := json.Marshal(ItemPayload{
		Fields:         fields,
		MetadataFields: []string{},
	})
	if err != nil {
		return "", err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.itemsURL(), bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+c.Token)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	respBody, status, err := c.doWithRetry(req)
	if err != nil {
		return "", err
	}
	if status < 200 || status >= 300 {
		return "", fmt.Errorf("create item: status %d: %s", status, truncate(string(respBody), 300))
	}
	var parsed struct {
		ID string `json:"id"`
	}
	_ = json.Unmarshal(respBody, &parsed)
	return parsed.ID, nil
}

// doWithRetry sends the request and retries on 429 / 5xx up to 3 times.
func (c *CMSClient) doWithRetry(req *http.Request) ([]byte, int, error) {
	var lastBody []byte
	var lastStatus int
	for attempt := 1; attempt <= 3; attempt++ {
		// Each attempt needs a fresh body for POST — callers pass nil for GET.
		cloned := req
		if req.GetBody != nil {
			body, err := req.GetBody()
			if err != nil {
				return nil, 0, err
			}
			cloned = req.Clone(req.Context())
			cloned.Body = body
		} else if req.Body != nil && attempt > 1 {
			// No GetBody was provided; we can't safely retry.
			return lastBody, lastStatus, fmt.Errorf("cannot retry request without GetBody")
		}

		resp, err := c.http.Do(cloned)
		if err != nil {
			if attempt == 3 {
				return nil, 0, err
			}
			time.Sleep(time.Duration(attempt) * time.Second)
			continue
		}
		body, _ := io.ReadAll(resp.Body)
		_ = resp.Body.Close()
		lastBody = body
		lastStatus = resp.StatusCode

		if resp.StatusCode == 429 || resp.StatusCode >= 500 {
			if attempt == 3 {
				return body, resp.StatusCode, nil
			}
			wait := time.Duration(attempt*attempt) * time.Second
			time.Sleep(wait)
			continue
		}
		return body, resp.StatusCode, nil
	}
	return lastBody, lastStatus, nil
}

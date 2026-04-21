package main

type areaAnnotationSeed struct {
	Title             string
	Body              string
	Lng               float64
	Lat               float64
	AnnotationType    string
	DisasterRelevance []string
	Severity          string
	Source            string
}

var areaAnnotations = []areaAnnotationSeed{
	{
		Title:             "江東5区 低地帯 — 大規模水害時は広域避難",
		Body:              "墨田・江東・江戸川・葛飾・足立の江東5区は海抜ゼロメートル地帯が広く、荒川・江戸川の氾濫や高潮で2週間以上の浸水が想定される区域がある。自治体のハザードマップで対象か確認し、該当する場合は早めに他区・他県への広域避難を検討。",
		Lng:               139.82,
		Lat:               35.71,
		AnnotationType:    "warning",
		DisasterRelevance: []string{"flood", "storm_surge", "typhoon"},
		Severity:          "danger",
		Source:            "江東5区広域避難推進協議会",
	},
	{
		Title:             "東京湾北部地震 — 想定震源域",
		Body:              "国が想定する首都直下地震の一つ「東京湾北部地震」(M7.3)は、江東区・大田区あたりを震源とし、最大震度7。建物倒壊・火災・帰宅困難者が同時発生するシナリオ。政府の被害想定レポートを参照。",
		Lng:               139.80,
		Lat:               35.60,
		AnnotationType:    "historical",
		DisasterRelevance: []string{"earthquake"},
		Severity:          "caution",
		Source:            "中央防災会議 首都直下地震対策検討WG",
	},
	{
		Title:             "新宿駅周辺 — 帰宅困難者対策エリア",
		Body:              "新宿駅は一日乗降客数が世界最多クラス。震災時は大量の帰宅困難者発生が見込まれ、駅周辺の大規模ビルが一時滞在施設として開放される。むやみに徒歩帰宅せず、安全な場所で待機するのが原則。",
		Lng:               139.70,
		Lat:               35.6895,
		AnnotationType:    "tip",
		DisasterRelevance: []string{"earthquake"},
		Severity:          "info",
		Source:            "東京都 帰宅困難者対策条例",
	},
	{
		Title:             "隅田川 — 氾濫の歴史",
		Body:              "隅田川は1947年カスリーン台風など過去に何度も氾濫。現在は荒川放水路により本流からの洪水はほぼ分離されているが、局地的豪雨時の内水氾濫リスクは残る。低地に住む場合は地下駐車場・半地下住居の浸水に注意。",
		Lng:               139.80,
		Lat:               35.72,
		AnnotationType:    "historical",
		DisasterRelevance: []string{"flood"},
		Severity:          "info",
		Source:            "国土交通省 荒川下流河川事務所",
	},
	{
		Title:             "銀座〜東京駅 地下街 — 集中豪雨時は地上へ",
		Body:              "銀座・有楽町・東京駅一帯の地下街は、1時間50mm以上のゲリラ豪雨時に冠水した事例がある。大雨警報・洪水警報が出たら地下街から地上へ速やかに移動。エスカレーターは使えないことが多いので階段で。",
		Lng:               139.76,
		Lat:               35.68,
		AnnotationType:    "warning",
		DisasterRelevance: []string{"flood"},
		Severity:          "caution",
		Source:            "千代田区・中央区 ハザードマップ",
	},
	{
		Title:             "木造住宅密集地域 — 延焼危険度が高い",
		Body:              "足立区・葛飾区・大田区・杉並区・世田谷区の一部は木造住宅が密集し、震災時の火災延焼リスクが高いとされる(都の「地震に関する地域危険度測定調査」第9回)。初期消火・家具転倒防止の優先度が高い地域。",
		Lng:               139.78,
		Lat:               35.78,
		AnnotationType:    "warning",
		DisasterRelevance: []string{"earthquake", "fire"},
		Severity:          "caution",
		Source:            "東京都 地震に関する地域危険度測定調査",
	},
	{
		Title:             "お台場・有明 — 液状化リスク",
		Body:              "東京湾岸の埋立地(お台場、有明、豊洲、東雲など)は地震時の液状化リスクが比較的高い。2011年東北地方太平洋沖地震でも一部で噴砂・沈下が確認された。地盤調査報告とハザードマップを合わせて確認。",
		Lng:               139.78,
		Lat:               35.625,
		AnnotationType:    "facility_note",
		DisasterRelevance: []string{"earthquake"},
		Severity:          "caution",
		Source:            "東京都 液状化予測図",
	},
	{
		Title:             "多摩川 — 2019年台風19号で越水",
		Body:              "2019年台風19号(令和元年東日本台風)で多摩川が各所で越水、世田谷区・大田区で浸水被害。普段は穏やかな多摩川も、上流域での豪雨で下流に危険が及ぶことを示した事例。",
		Lng:               139.65,
		Lat:               35.60,
		AnnotationType:    "historical",
		DisasterRelevance: []string{"flood", "typhoon"},
		Severity:          "info",
		Source:            "国土交通省 京浜河川事務所",
	},
	{
		Title:             "渋谷駅周辺 — 谷地形の浸水リスク",
		Body:              "渋谷駅は名前のとおり谷の底。周囲の高台から流入する雨水が集まりやすく、集中豪雨時に駅周辺道路や地下街が冠水した事例がある。深い地下ホーム(銀座線を除く)は特に注意。",
		Lng:               139.70,
		Lat:               35.658,
		AnnotationType:    "facility_note",
		DisasterRelevance: []string{"flood"},
		Severity:          "caution",
		Source:            "渋谷区 内水ハザードマップ",
	},
}

func areaAnnotationSpec() SeedSpec {
	return SeedSpec{
		Model:       "area_annotation",
		ModelKeyEnv: "CMS_ANNOTATION_MODEL_KEY",
		DedupField:  "title",
		Count:       len(areaAnnotations),
		Iter: func(i int) (string, []Field) {
			a := areaAnnotations[i]
			fields := []Field{
				{Key: "title", Type: typeText, Value: a.Title},
				{Key: "body", Type: typeTextArea, Value: a.Body},
				{Key: "location", Type: typeGeometryObject, Value: map[string]interface{}{
					"type":        "Point",
					"coordinates": []float64{a.Lng, a.Lat},
				}},
				{Key: "annotation_type", Type: typeSelect, Value: a.AnnotationType},
				{Key: "disaster_relevance", Type: typeSelect, Value: a.DisasterRelevance},
				{Key: "severity", Type: typeSelect, Value: a.Severity},
			}
			if a.Source != "" {
				fields = append(fields, Field{Key: "source", Type: typeText, Value: a.Source})
			}
			return a.Title, fields
		},
	}
}

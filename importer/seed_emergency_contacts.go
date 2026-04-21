package main

type emergencyContactSeed struct {
	Label           string
	LabelEN         string
	Number          string
	Type            string
	Scope           string
	AvailableHours  string
	URL             string
	Priority        int
	Notes           string
}

// Numbers mix real public lines (metro police HQ, TEPCO outage) with
// realistic-looking placeholders for ward-level DRM departments. Real values
// change occasionally; treat this as demo data and verify before emergency use.
var emergencyContacts = []emergencyContactSeed{
	// Metro-wide
	{
		Label:          "警視庁 総合相談センター",
		LabelEN:        "Metropolitan Police General Consultation",
		Number:         "#9110",
		Type:           "police",
		Scope:          "city",
		AvailableHours: "24時間",
		Priority:       90,
		URL:            "https://www.keishicho.metro.tokyo.lg.jp/",
		Notes:          "緊急でない相談(不審電話・ストーカー・家庭内暴力など)。",
	},
	{
		Label:          "東京消防庁 救急相談センター",
		LabelEN:        "Tokyo Fire Dept — Emergency Medical Advice",
		Number:         "#7119",
		Type:           "ambulance",
		Scope:          "city",
		AvailableHours: "24時間",
		Priority:       95,
		URL:            "https://www.tfd.metro.tokyo.lg.jp/lfe/kyuu-adv/",
		Notes:          "救急車を呼ぶか迷った時の相談窓口。医師・看護師・救急隊員が対応。",
	},
	{
		Label:          "東京都 防災情報",
		LabelEN:        "Tokyo Disaster Information Hotline",
		Number:         "03-5320-7700",
		Type:           "disaster_line",
		Scope:          "city",
		AvailableHours: "24時間",
		Priority:       80,
		URL:            "https://www.bousai.metro.tokyo.lg.jp/",
		Notes:          "都の防災・災害時対応に関する情報提供。",
	},
	// Utilities
	{
		Label:          "東京電力 停電・緊急時",
		LabelEN:        "TEPCO Outage Hotline",
		Number:         "0120-995-007",
		Type:           "disaster_line",
		Scope:          "city",
		AvailableHours: "24時間",
		Priority:       70,
		URL:            "https://teideninfo.tepco.co.jp/",
		Notes:          "停電情報はウェブの「停電情報マップ」もあわせて。",
	},
	{
		Label:          "東京都水道局 お客さまセンター",
		LabelEN:        "Tokyo Waterworks Customer Centre",
		Number:         "03-5326-1101",
		Type:           "disaster_line",
		Scope:          "city",
		AvailableHours: "平日 8:30-20:00 土日祝 8:30-17:00",
		Priority:       60,
		URL:            "https://www.waterworks.metro.tokyo.lg.jp/",
		Notes:          "漏水・断水・水質に関する問い合わせ。",
	},
	{
		Label:          "東京ガス お客さまセンター",
		LabelEN:        "Tokyo Gas Customer Centre",
		Number:         "0570-002211",
		Type:           "disaster_line",
		Scope:          "city",
		AvailableHours: "24時間(ガス漏れ・緊急時)",
		Priority:       65,
		URL:            "https://www.tokyo-gas.co.jp/",
		Notes:          "ガス漏れの疑いがある時は窓を開け、火気厳禁で。",
	},
	// Ward-level DRM departments (placeholders — verify before real use)
	{
		Label:          "新宿区 危機管理課",
		LabelEN:        "Shinjuku Ward Crisis Management Division",
		Number:         "03-5273-4467",
		Type:           "city_hall",
		Scope:          "city",
		AvailableHours: "平日 8:30-17:00",
		Priority:       50,
		URL:            "https://www.city.shinjuku.lg.jp/",
		Notes:          "新宿区内の防災・避難所運営に関する窓口。",
	},
	{
		Label:          "渋谷区 地域防災課",
		LabelEN:        "Shibuya Ward Disaster Prevention Division",
		Number:         "03-3463-1211",
		Type:           "city_hall",
		Scope:          "city",
		AvailableHours: "平日 8:30-17:00",
		Priority:       48,
		URL:            "https://www.city.shibuya.tokyo.jp/",
	},
	{
		Label:          "千代田区 災害対策・危機管理課",
		LabelEN:        "Chiyoda Ward Crisis Management Division",
		Number:         "03-3264-2111",
		Type:           "city_hall",
		Scope:          "city",
		AvailableHours: "平日 8:30-17:00",
		Priority:       46,
		URL:            "https://www.city.chiyoda.lg.jp/",
	},
	{
		Label:          "世田谷区 災害対策課",
		LabelEN:        "Setagaya Ward Disaster Countermeasures Division",
		Number:         "03-5432-2262",
		Type:           "city_hall",
		Scope:          "city",
		AvailableHours: "平日 8:30-17:00",
		Priority:       44,
		URL:            "https://www.city.setagaya.lg.jp/",
	},
	// Rivers / floods
	{
		Label:          "国土交通省 荒川下流河川事務所",
		LabelEN:        "MLIT Lower Arakawa River Office",
		Number:         "03-3902-2311",
		Type:           "river",
		Scope:          "city",
		AvailableHours: "平日 8:30-17:15",
		Priority:       40,
		URL:            "https://www.ktr.mlit.go.jp/arage/",
		Notes:          "荒川(足立・葛飾・江戸川・北区など)の水位・洪水対応。",
	},
	// Welfare / vulnerable people
	{
		Label:          "東京都 福祉保健局",
		LabelEN:        "Tokyo Bureau of Social Welfare and Public Health",
		Number:         "03-5320-4035",
		Type:           "welfare",
		Scope:          "city",
		AvailableHours: "平日 9:00-17:00",
		Priority:       35,
		URL:            "https://www.fukushihoken.metro.tokyo.lg.jp/",
		Notes:          "高齢者・障害者・要配慮者支援の情報。",
	},
}

func emergencyContactSpec() SeedSpec {
	return SeedSpec{
		Model:       "emergency_contact",
		ModelKeyEnv: "CMS_CONTACT_MODEL_KEY",
		DedupField:  "label",
		Count:       len(emergencyContacts),
		Iter: func(i int) (string, []Field) {
			c := emergencyContacts[i]
			fields := []Field{
				{Key: "label", Type: typeText, Value: c.Label},
				{Key: "number", Type: typeText, Value: c.Number},
				{Key: "type", Type: typeSelect, Value: c.Type},
				{Key: "scope", Type: typeSelect, Value: c.Scope},
				{Key: "priority", Type: typeInteger, Value: c.Priority},
			}
			if c.LabelEN != "" {
				fields = append(fields, Field{Key: "label_en", Type: typeText, Value: c.LabelEN})
			}
			if c.AvailableHours != "" {
				fields = append(fields, Field{Key: "available_hours", Type: typeText, Value: c.AvailableHours})
			}
			if c.URL != "" {
				fields = append(fields, Field{Key: "url", Type: typeURL, Value: c.URL})
			}
			if c.Notes != "" {
				fields = append(fields, Field{Key: "notes", Type: typeTextArea, Value: c.Notes})
			}
			return c.Label, fields
		},
	}
}

package main

type checklistItemSeed struct {
	Label          string
	LabelEN        string
	Category       string
	Priority       int
	Detail         string
	DetailEN       string
	QuantityHint   string
	CoastalOnly    bool
	ColdRegionOnly bool
}

var checklistItems = []checklistItemSeed{
	// water_food
	{
		Label:        "飲料水",
		LabelEN:      "Drinking water",
		Category:     "water_food",
		Priority:     100,
		QuantityHint: "1人3L × 3日分",
		Detail:       "ペットボトル(500mL・2L混在)が使いやすい。賞味期限は5〜15年保存水も。",
		DetailEN:     "Mix 500 ml and 2 L bottles for flexibility. Long-life emergency water (5–15 yr shelf life) is worth it.",
	},
	{
		Label:        "アルファ米・レトルト飯",
		LabelEN:      "Alpha rice / retort rice",
		Category:     "water_food",
		Priority:     90,
		QuantityHint: "1人9食(3食×3日)",
		Detail:       "水だけで戻せるアルファ米が便利。複数の味を用意して飽きを防ぐ。",
		DetailEN:     "Alpha rice needs only water. Stock multiple flavours to avoid fatigue.",
	},
	{
		Label:        "栄養補助食品・缶詰",
		LabelEN:      "Energy bars / canned food",
		Category:     "water_food",
		Priority:     85,
		QuantityHint: "1週間分を目安",
		Detail:       "カロリーメイト、羊羹、さば缶、フルーツ缶など。プルトップ式を選ぶ。",
		DetailEN:     "Bars, sweets, canned fish and fruit. Choose pull-tab cans — no opener needed.",
	},
	{
		Label:        "カセットコンロ+ボンベ",
		LabelEN:      "Cassette stove + butane",
		Category:     "water_food",
		Priority:     80,
		QuantityHint: "ボンベ6本/1週間",
		Detail:       "停電時の調理・湯沸かし用。屋内で使うときは換気を。",
		DetailEN:     "For cooking and boiling during outages. Ventilate if using indoors.",
	},
	{
		Label:        "紙皿・紙コップ・ラップ",
		LabelEN:      "Paper plates / cups / plastic wrap",
		Category:     "water_food",
		Priority:     60,
		Detail:       "食器の上にラップを敷けば洗わず再利用可。水の節約になる。",
		DetailEN:     "Lay plastic wrap over plates — reuse without washing. Saves water.",
	},

	// medical
	{
		Label:        "常備薬・処方薬",
		LabelEN:      "Prescription medications",
		Category:     "medical",
		Priority:     100,
		QuantityHint: "2週間分+お薬手帳のコピー",
		Detail:       "持病のある人は最優先。お薬手帳があれば被災地でも処方を受けやすい。",
		DetailEN:     "Top priority if you take daily meds. Keep a medication record (okusuri-techo) copy to simplify refill requests.",
	},
	{
		Label:        "救急セット",
		LabelEN:      "First-aid kit",
		Category:     "medical",
		Priority:     90,
		Detail:       "絆創膏、消毒液、ガーゼ、三角巾、包帯、ピンセット、はさみ。",
		DetailEN:     "Bandages, antiseptic, gauze, triangular bandage, tweezers, scissors.",
	},
	{
		Label:        "マスク",
		LabelEN:      "Masks",
		Category:     "medical",
		Priority:     70,
		QuantityHint: "1人20枚以上",
		Detail:       "粉塵・火山灰・感染症対策。避難所での感染症リスク低減にも。",
		DetailEN:     "For dust, ash, and infection. Shelters are crowded — masks help.",
	},
	{
		Label:        "体温計",
		LabelEN:      "Thermometer",
		Category:     "medical",
		Priority:     55,
		Detail:       "子どもや高齢者の体調変化をつかむのに必須。",
		DetailEN:     "Essential for catching fever early in kids and elderly.",
	},
	{
		Label:        "生理用品",
		LabelEN:      "Menstrual products",
		Category:     "medical",
		Priority:     85,
		QuantityHint: "普段の2〜3周期分",
		Detail:       "被災時は支援物資に含まれないことも。多めに。おりものシートも便利。",
		DetailEN:     "Not always in relief supplies. Stock 2–3 cycles. Liners help too.",
	},

	// tools
	{
		Label:        "懐中電灯・ヘッドライト",
		LabelEN:      "Flashlight / headlamp",
		Category:     "tools",
		Priority:     100,
		QuantityHint: "1人1つ+予備電池",
		Detail:       "ヘッドライトは両手が空くので作業時に便利。電池は別保管。",
		DetailEN:     "Headlamps keep both hands free. Store spare batteries separately.",
	},
	{
		Label:        "モバイルバッテリー",
		LabelEN:      "Power bank",
		Category:     "tools",
		Priority:     95,
		QuantityHint: "20000mAh程度",
		Detail:       "スマホを複数回充電できる容量。ソーラー式も選択肢。",
		DetailEN:     "20,000 mAh fits several phone recharges. Solar types add resilience.",
	},
	{
		Label:        "携帯ラジオ",
		LabelEN:      "Portable radio",
		Category:     "tools",
		Priority:     80,
		Detail:       "手回し発電・ソーラー・USB充電兼用が理想。AM/FM/ワイドFM対応。",
		DetailEN:     "Hand-crank + solar + USB is ideal. AM/FM/Wide FM support.",
	},
	{
		Label:        "軍手・革手袋",
		LabelEN:      "Work gloves",
		Category:     "tools",
		Priority:     70,
		Detail:       "ガラス片・瓦礫処理に。革製なら切傷しにくい。",
		DetailEN:     "For broken glass and debris. Leather resists cuts best.",
	},
	{
		Label:        "笛・ホイッスル",
		LabelEN:      "Whistle",
		Category:     "tools",
		Priority:     65,
		Detail:       "がれきに閉じ込められた時の救難信号。声より遠くに届く。",
		DetailEN:     "Signal rescuers if you're trapped. Carries much further than shouting.",
	},
	{
		Label:        "簡易トイレ",
		LabelEN:      "Emergency toilet kit",
		Category:     "tools",
		Priority:     95,
		QuantityHint: "1人35回分(5回×7日)",
		Detail:       "凝固剤と袋のセット。下水が使えなくなった想定。",
		DetailEN:     "Bags + coagulant sachets. Plan for sewage disruption.",
	},
	{
		Label:        "ブルーシート・ロープ",
		LabelEN:      "Tarp + rope",
		Category:     "tools",
		Priority:     45,
		Detail:       "屋根の応急修理、避難所でのプライバシー確保に。",
		DetailEN:     "Emergency roof patch or shelter privacy screen.",
	},

	// documents
	{
		Label:        "身分証のコピー",
		LabelEN:      "ID photocopies",
		Category:     "documents",
		Priority:     85,
		Detail:       "運転免許証・マイナンバーカード・パスポートのコピーを防水袋に。",
		DetailEN:     "Licence, MyNumber card, passport — copies in a waterproof pouch.",
	},
	{
		Label:        "保険証・お薬手帳のコピー",
		LabelEN:      "Health insurance / medication record copy",
		Category:     "documents",
		Priority:     80,
		Detail:       "医療機関で処方・治療を受ける際に必要。",
		DetailEN:     "Needed for treatment and prescriptions at any clinic.",
	},
	{
		Label:        "現金(小銭多め)",
		LabelEN:      "Cash (plenty of coins)",
		Category:     "documents",
		Priority:     70,
		QuantityHint: "2〜3万円程度",
		Detail:       "停電でキャッシュレス決済・ATMが使えない。公衆電話用の10円玉も。",
		DetailEN:     "Cashless and ATMs go down with power outages. Keep ¥10 coins for pay phones.",
	},

	// plan
	{
		Label:        "家族の連絡先リスト",
		LabelEN:      "Family contact list",
		Category:     "plan",
		Priority:     75,
		Detail:       "紙でプリントアウト。スマホが使えなくなった時のために。",
		DetailEN:     "Print it out. Don't rely on your phone's contacts.",
	},
	{
		Label:        "集合場所の地図",
		LabelEN:      "Map of rally points",
		Category:     "plan",
		Priority:     70,
		Detail:       "第1集合場所・第2集合場所・最寄り避難所を家族で共有。",
		DetailEN:     "Near + far rally point + nearest shelter — share with family.",
	},
	{
		Label:        "家具の固定・ガラス飛散防止",
		LabelEN:      "Anchor furniture, apply window film",
		Category:     "plan",
		Priority:     90,
		Detail:       "L字金具・突っ張り棒・耐震マット・飛散防止フィルムを事前に設置。",
		DetailEN:     "L-brackets, tension rods, anti-slip pads, shatter-proof film — before disaster.",
	},

	// communication
	{
		Label:        "災害用伝言ダイヤル171の練習",
		LabelEN:      "Practice 171 (Disaster Message Dial)",
		Category:     "communication",
		Priority:     60,
		Detail:       "毎月1日・15日と防災週間に体験利用可。録音・再生を家族で試す。",
		DetailEN:     "Free trial on the 1st/15th each month and during disaster-prep week. Family should practice record + playback.",
	},
	{
		Label:        "充電ケーブル(複数規格)",
		LabelEN:      "Charging cables (multi-standard)",
		Category:     "communication",
		Priority:     55,
		Detail:       "USB-C・Lightning・Micro-USB の3本を1セットに。",
		DetailEN:     "Pack USB-C, Lightning, and Micro-USB together.",
	},
}

func checklistItemSpec() SeedSpec {
	return SeedSpec{
		Model:       "checklist_item",
		ModelKeyEnv: "CMS_CHECKLIST_MODEL_KEY",
		DedupField:  "label",
		Count:       len(checklistItems),
		Iter: func(i int) (string, []Field) {
			c := checklistItems[i]
			fields := []Field{
				{Key: "label", Type: typeText, Value: c.Label},
				{Key: "category", Type: typeSelect, Value: c.Category},
				{Key: "priority", Type: typeInteger, Value: c.Priority},
				{Key: "coastal_only", Type: typeBool, Value: c.CoastalOnly},
				{Key: "cold_region_only", Type: typeBool, Value: c.ColdRegionOnly},
			}
			if c.LabelEN != "" {
				fields = append(fields, Field{Key: "label_en", Type: typeText, Value: c.LabelEN})
			}
			if c.Detail != "" {
				fields = append(fields, Field{Key: "detail", Type: typeTextArea, Value: c.Detail})
			}
			if c.DetailEN != "" {
				fields = append(fields, Field{Key: "detail_en", Type: typeTextArea, Value: c.DetailEN})
			}
			if c.QuantityHint != "" {
				fields = append(fields, Field{Key: "quantity_hint", Type: typeText, Value: c.QuantityHint})
			}
			return c.Label, fields
		},
	}
}

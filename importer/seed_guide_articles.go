package main

type guideArticleSeed struct {
	Title        string
	TitleEN      string
	DisasterType string
	Phase        string
	Priority     int
	Summary      string
	Body         string
	BodyEN       string
	IsCritical   bool
	IconKey      string
}

var guideArticles = []guideArticleSeed{
	// ── Earthquake ─────────────────────────────────────────────────────────
	{
		Title:        "地震が起きた瞬間の身の守り方",
		TitleEN:      "What to do the moment an earthquake hits",
		DisasterType: "earthquake",
		Phase:        "during",
		Priority:     100,
		IsCritical:   true,
		Summary:      "揺れている数十秒でいのちを守る3つの行動。",
		Body: `## まず身を守る

- 頭を守り、**机の下**など丈夫な家具の下に入る。
- 揺れが収まるまで動かない。倒れてくる家具・ガラスから離れる。
- ドアを開けて出口を確保(揺れの合間に)。

## やってはいけないこと

- いきなり外に飛び出さない(落下物の危険)。
- エレベーターは使わない。
- 火を使っているとき、無理に消しに行かない。揺れが収まってから止める。
`,
		BodyEN: `## Protect yourself first

- Cover your head and get under a **sturdy desk or table**.
- Stay put until the shaking stops. Move away from heavy furniture and glass.
- Open a door to secure an exit — but only between tremors.

## Don't

- Don't run outside mid-shake — falling debris is the top risk.
- Don't use elevators.
- Don't rush to turn off open flames while shaking; wait until it stops.
`,
	},
	{
		Title:        "避難前に確認する3つのこと",
		TitleEN:      "Three checks before evacuating",
		DisasterType: "earthquake",
		Phase:        "after",
		Priority:     95,
		IsCritical:   true,
		Summary:      "ブレーカー・ガスの元栓・窓の施錠を忘れずに。",
		Body: `避難を始める前に、火災と二次被害を防ぐために3つを必ず確認。

1. **電気のブレーカーを落とす** — 通電火災を防ぐ。
2. **ガスの元栓を閉める** — 余震に備える。
3. **窓とドアを施錠** — 空き巣を防ぐ。

持ち出し袋を背負い、**動きやすい靴**で避難。ガラス片で怪我をしないよう注意。
`,
		BodyEN: `Before you evacuate, run through three checks to prevent fires and secondary damage.

1. **Flip the main breaker** — prevents "energised fire" when power returns.
2. **Close the gas main valve** — guards against aftershock damage.
3. **Lock doors and windows** — deters burglary during the evacuation.

Wear **sturdy shoes** and take your go-bag. Broken glass is the top injury cause indoors.
`,
	},
	{
		Title:        "家具の転倒防止",
		TitleEN:      "Secure your furniture before it's too late",
		DisasterType: "earthquake",
		Phase:        "before",
		Priority:     85,
		Summary:      "死傷者の約半数は家具の転倒・落下物が原因。",
		Body: `大地震での負傷者の約30〜50%は、家具・家電の転倒や落下物によるもの(消防庁調べ)。

## やること

- **L字金具・突っ張り棒**で背の高い家具を壁に固定。
- テレビ・電子レンジは**耐震マット**で固定。
- 食器棚の扉は**開き防止ラッチ**で。
- 寝室には背の高い家具を置かない。ベッドの真上に絵や時計もNG。
`,
		BodyEN: `Up to half of earthquake injuries are caused by toppling furniture or falling objects (Japan Fire and Disaster Management Agency).

## Do this

- Anchor tall furniture with **L-brackets or tension rods**.
- Use **anti-slip pads** under the TV and microwave.
- Install **door latches** on cupboards.
- Don't put tall furniture in the bedroom, and nothing heavy directly above the bed.
`,
	},
	{
		Title:        "津波警報が出たら",
		TitleEN:      "When a tsunami warning is issued",
		DisasterType: "tsunami",
		Phase:        "during",
		Priority:     100,
		IsCritical:   true,
		Summary:      "高いところへ、すぐに。海岸・川から離れる。",
		Body: `**1分でも早く、1メートルでも高い場所へ。**

- 車での避難は渋滞・冠水で動けなくなる。**徒歩で高台・津波避難ビル**へ。
- 川沿いは津波が遡上する。河川敷からも離れる。
- 揺れが小さくても津波は来る。**警報を信じる**。
- 警報解除までは戻らない。第二波・第三波のほうが大きいこともある。

## 東京湾の津波想定

東京湾内は地形の関係で大津波の可能性は相対的に低いが、**AP+2.5m 以上**の想定区域(港区・江東区の一部)では即時避難。
`,
		BodyEN: `**A minute earlier, a metre higher. Move now.**

- Don't drive — traffic jams and flooding trap cars. Go on foot to **high ground or a designated tsunami evacuation building**.
- Stay away from rivers. Tsunamis travel upstream far inland.
- Even a small quake can spawn a tsunami. **Trust the warning.**
- Don't return until the warning is fully lifted — the second or third wave is often larger.

## Tokyo Bay

Bay geometry limits major tsunami risk inside Tokyo Bay, but designated inundation zones in parts of Minato and Koto wards (AP+2.5m and above) require immediate evacuation.
`,
	},

	// ── Flood / Typhoon ───────────────────────────────────────────────────
	{
		Title:        "大雨・洪水から身を守る",
		TitleEN:      "Protect yourself during heavy rain and flooding",
		DisasterType: "flood",
		Phase:        "during",
		Priority:     90,
		IsCritical:   true,
		Summary:      "地下・川沿いに近づかない。早めの垂直避難を。",
		Body: `## やること

- 河川・用水路・地下街には**近づかない**。
- 道路が**くるぶし以上**冠水したら徒歩移動は危険。
- 避難が遅れたら**自宅の2階以上**へ(垂直避難)。
- マンホールや側溝は見えないので、**杖で足元を確認**しながら移動。

## 車の水没

ドアは**30cm**の浸水で開かなくなる。水が来たら**窓から脱出**。
`,
		BodyEN: `## What to do

- Stay **away** from rivers, canals, and underground malls.
- Don't walk through water **above the ankle** — currents and manholes.
- If you can't leave, move to the **2nd floor or higher** (vertical evacuation).
- Probe the ground ahead with a stick — covers can be missing.

## Car submerged

Doors won't open at **30 cm** of water pressure. Exit through the window.
`,
	},
	{
		Title:        "台風が近づく前に",
		TitleEN:      "Before a typhoon arrives",
		DisasterType: "typhoon",
		Phase:        "before",
		Priority:     90,
		Summary:      "窓の補強・ベランダの片付け・気象情報のチェック。",
		Body: `上陸48時間前から準備を。

- **ベランダ・庭**の植木鉢、物干し竿、自転車を屋内へ。
- 窓には**養生テープを米印に**、内側からダンボールで補強。飛散防止にはなる。
- 停電に備えて**モバイルバッテリー・懐中電灯**を充電。
- 冷蔵庫の食料を減らし、**冷凍庫は満杯**に(保冷効果UP)。
- 風呂に水を貯める(生活用水)。
`,
		BodyEN: `Start 48 hours before landfall.

- Bring in everything loose from **the balcony or garden** — pots, laundry poles, bikes.
- Tape windows in a **cross pattern** and reinforce from inside with cardboard. It reduces flying glass.
- Charge **power banks and flashlights** in case of outages.
- Empty the fridge a bit but **fill the freezer** — it stays cold longer.
- Fill the bathtub with water (utility supply, not drinking).
`,
	},
	{
		Title:        "氾濫危険水位とは",
		TitleEN:      "What the flood alert levels mean",
		DisasterType: "flood",
		Phase:        "before",
		Priority:     60,
		Summary:      "5段階の警戒レベルと行動の目安。",
		Body: `気象庁・自治体の**警戒レベル**は5段階。

| レベル | 状況 | 行動 |
|---|---|---|
| 1 | 早期注意 | 心構え |
| 2 | 注意 | ハザードマップ確認 |
| 3 | **高齢者等避難** | 避難に時間のかかる人は避難 |
| 4 | **避難指示** | 全員避難 |
| 5 | **緊急安全確保** | 命を守る最善の行動 |

**レベル4で必ず避難**。レベル5は「すでに災害が発生または切迫している」状態で、避難が間に合わない前提。
`,
		BodyEN: `Japan uses a five-level alert scale.

| Level | Meaning | Action |
|---|---|---|
| 1 | Early notice | Stay aware |
| 2 | Advisory | Check hazard map |
| 3 | **Elderly evacuation** | Slow-to-move people evacuate |
| 4 | **Evacuation order** | Everyone evacuates |
| 5 | **Emergency safety action** | Save your life — any way you can |

**Evacuate by level 4**. Level 5 means the disaster is already happening; normal evacuation is no longer assumed possible.
`,
	},
	{
		Title:        "都心の地下は水に弱い",
		TitleEN:      "Underground Tokyo is vulnerable to flooding",
		DisasterType: "flood",
		Phase:        "during",
		Priority:     70,
		Summary:      "地下街・地下鉄は冠水で出口がふさがる。",
		Body: `東京の地下空間は**ゲリラ豪雨・大雨**で急激に冠水する。

- 銀座・新宿・渋谷・東京駅など**地下街**にいる時に大雨警報が出たら、**すぐに地上へ**。
- 地下鉄も**駅構内の階段から水が流れ込む**事例あり。
- エスカレーターは水没すると使えない。階段で。
- **出口を1つに固執しない**。複数方向へ。
`,
		BodyEN: `Tokyo's underground fills up fast during **guerrilla rainstorms**.

- In underground malls (Ginza, Shinjuku, Shibuya, Tokyo Station), move **up to street level immediately** when a heavy-rain warning fires.
- Subway stations can flood via their own staircase entrances.
- Don't rely on escalators — use stairs.
- Don't fixate on one exit — try multiple directions.
`,
	},

	// ── Fire ──────────────────────────────────────────────────────────────
	{
		Title:        "火災を発見したら",
		TitleEN:      "If you spot a fire",
		DisasterType: "fire",
		Phase:        "during",
		Priority:     95,
		IsCritical:   true,
		Summary:      "「火事だー!」と叫ぶ・通報・初期消火。3つを同時に。",
		Body: `初期対応の3原則:

1. **大声で知らせる** — 「火事だー!」と周囲に。
2. **119番通報** — 住所・目標物を伝える。
3. **初期消火** — 天井に火が届く前なら消火器で。届いたら**逃げる**。

## 煙から身を守る

- **姿勢を低く**、**濡れたタオル**で口を覆う。
- ドアを開ける前に**ノブが熱くないか**確認。熱ければ別経路。
`,
		BodyEN: `Three simultaneous actions:

1. **Shout loudly** — "Kaji-da!" (Fire!). Wake neighbours.
2. **Call 119** — give address and a landmark.
3. **Initial suppression** — use an extinguisher while flames are below the ceiling. Once they reach the ceiling, **run**.

## Smoke

- Stay **low**, cover your mouth with a **damp cloth**.
- Before opening a door, check if the **knob is hot** — if so, find another route.
`,
	},
	{
		Title:        "住宅用火災警報器のチェック",
		TitleEN:      "Check your home smoke alarm",
		DisasterType: "fire",
		Phase:        "before",
		Priority:     50,
		Summary:      "10年ごとに交換。ボタンを押して作動確認を年1回。",
		Body: `住宅用火災警報器は2006年から新築で義務化、2011年までに既存住宅も。**寝室と階段に設置**が原則。

- **作動確認**は年1回、ボタンを押して音を確認。
- **電池切れの警告音**が鳴ったら電池交換。
- **10年で本体交換**が目安(電子部品の劣化)。
`,
		BodyEN: `Smoke alarms have been mandatory in new housing since 2006 and all homes by 2011. Install one in **every bedroom and at the top of the stairs**.

- **Test yearly** — press the button and listen.
- Replace the **battery** when the low-battery chirp starts.
- Replace the **whole unit every 10 years** — electronics degrade.
`,
	},

	// ── Before / prep (multi-disaster) ────────────────────────────────────
	{
		Title:        "家族の集合場所を決める",
		TitleEN:      "Agree on a family rally point",
		DisasterType: "earthquake",
		Phase:        "before",
		Priority:     80,
		Summary:      "通信が途絶しても会える場所を、事前にひとつ。",
		Body: `災害時は**電話もLINEもつながらない**。事前に物理的な集合場所を決めておく。

## 目安

- 自宅近く(徒歩圏)に**第1集合場所** — 指定避難所 or 近所の公園。
- 広域で会う**第2集合場所** — 実家・知人宅など。
- **災害用伝言ダイヤル171**と**Web171**の使い方を家族で練習。毎月1日・15日と防災週間に体験利用できる。
`,
		BodyEN: `Phones and LINE usually go down. Agree on a physical meeting point in advance.

## Pick two

- A **nearby rally point** — your designated shelter or a neighbourhood park.
- A **distant fallback** — a relative's home in another city.
- Practice **171 Disaster Message Dial** and **Web171** with your family. Trial service runs on the 1st/15th of each month and during disaster-prep week.
`,
	},
	{
		Title:        "ハザードマップを確認する",
		TitleEN:      "Check your hazard map",
		DisasterType: "flood",
		Phase:        "before",
		Priority:     75,
		Summary:      "自宅・職場・通学路の浸水想定を知っておく。",
		Body: `各区の**ハザードマップ**で、自宅・職場・子どもの通学路の想定浸水深、津波、土砂災害危険区域を確認。

- 国土交通省「重ねるハザードマップ」: 全国を1つの地図で重ね見できる。
- 区のハザードマップ(PDFや冊子)は区役所・ウェブで配布。
- **浸水深3m**は1階天井まで。**5m**は2階天井まで。数字の意味を把握して避難方針を立てる。
`,
		BodyEN: `Each ward publishes a **hazard map** showing expected flood depth, tsunami zones, and landslide risk. Check your home, workplace, and children's route to school.

- MLIT's "Overlay Hazard Map" combines all hazards nationwide in one interface.
- Ward hazard maps are available at the ward office and online.
- **3 m flood depth** reaches first-floor ceilings; **5 m** reaches second-floor ceilings. Plan your vertical-evacuation strategy accordingly.
`,
	},
	{
		Title:        "非常持ち出し袋の中身",
		TitleEN:      "What goes in a go-bag",
		DisasterType: "earthquake",
		Phase:        "before",
		Priority:     70,
		Summary:      "最初の1日を生き延びる装備。両手が空く点が重要。",
		Body: `避難時にすぐ持ち出せる**1次持ち出し袋**。リュックで両手が空くこと。

## 最低限

- 水500mL×2本、栄養補助食品
- 懐中電灯・モバイルバッテリー
- 携帯ラジオ(手回し式が望ましい)
- 常備薬・処方薬のコピー
- 現金(小銭を多めに)
- 保険証・免許証の**コピー**
- 軍手・笛・ホイッスル
- 雨具・タオル・ウェットティッシュ

重さは**体重の10%以内**が目安。女性・子どもは特に無理のない重さで。
`,
		BodyEN: `The **day-one go-bag** you grab on the way out. Backpack, so both hands stay free.

## Minimum

- Two 500 ml water bottles + energy bars
- Flashlight + power bank
- Portable radio (hand-crank preferred)
- Medications / prescription copies
- Cash (plenty of coins)
- **Photocopies** of health insurance and ID
- Work gloves, whistle
- Rain gear, towel, wet wipes

Aim for **under 10% of body weight**. Women and kids should go lighter.
`,
	},
	{
		Title:        "在宅避難の備蓄",
		TitleEN:      "Stocking for shelter-in-place",
		DisasterType: "earthquake",
		Phase:        "before",
		Priority:     65,
		Summary:      "避難所が満員でも自宅で1週間過ごせる備え。",
		Body: `東京都は**最低3日、できれば1週間**の在宅備蓄を推奨。

## 目安(1人あたり)

- **水** — 1日3L × 7日 = 21L
- **食料** — レトルト米、缶詰、フリーズドライ
- **カセットコンロ+ボンベ** — 1週間で6本程度
- **簡易トイレ** — 1日5回 × 7日 = 35回分
- **ゴミ袋・消臭剤**
- **電池・モバイルバッテリー**

**ローリングストック法**: 普段食べるものを多めに買い、古いものから消費する。非常食の期限切れを防ぐ。
`,
		BodyEN: `Tokyo's guidance: **3 days minimum, 1 week preferred**, of shelter-in-place supplies.

## Per person

- **Water** — 3 L/day × 7 days = 21 L
- **Food** — retort rice, canned goods, freeze-dried meals
- **Cassette stove + butane** — ~6 canisters a week
- **Emergency toilet** — 5 uses/day × 7 days = 35
- **Bin bags, deodorizer**
- **Batteries, power banks**

**Rolling-stock method**: buy extra of what you normally eat, consume oldest first. No more expired emergency food.
`,
	},

	// ── After / recovery ──────────────────────────────────────────────────
	{
		Title:        "避難所でのすごし方",
		TitleEN:      "Life at an evacuation shelter",
		DisasterType: "earthquake",
		Phase:        "after",
		Priority:     55,
		Summary:      "感染症・エコノミー症候群・プライバシーに注意。",
		Body: `避難所は**密集**しており、体調管理が難しい。

## 健康面

- **エコノミークラス症候群**予防に、1〜2時間に1回は立って歩く。水分もしっかり。
- **手洗い・マスク**で感染症予防。
- 食事と水分の記録を付けると体調の変化に気づきやすい。

## 心理面

- プライバシー確保のため**段ボール間仕切り**の導入が進んでいる。
- 子ども・高齢者は**生活リズム**を崩しやすい。朝日を浴びて、日中は軽く体を動かす。
`,
		BodyEN: `Shelters are **crowded**, making it hard to stay healthy.

## Health

- Walk 5 minutes every 1–2 hours to prevent **deep-vein thrombosis** ("economy-class syndrome"). Drink water.
- Handwashing and masks to reduce infection.
- Log meals and fluids; it's easier to notice trouble early.

## Mental health

- Cardboard partitions for privacy are increasingly available.
- Kids and elderly lose their rhythm fastest. Morning sunlight and some light movement during the day help.
`,
	},
	{
		Title:        "被災後の詐欺・悪質商法に注意",
		TitleEN:      "Scams after a disaster",
		DisasterType: "earthquake",
		Phase:        "after",
		Priority:     40,
		Summary:      "屋根修理・保険金請求代行・寄付詐欺が急増。",
		Body: `被災後は**訪問販売や電話勧誘による詐欺**が増える。

## 典型的な手口

- 「屋根が壊れている」と**不安をあおり高額契約**。
- 「保険金が全額おります」と**修理代行**を名乗る悪質業者。
- 「募金です」と偽装した**寄付詐欺**。

## 対策

- その場で契約しない。**名刺と見積書**を受け取り、家族と相談。
- **国民生活センター**(188, いやや)に相談。
- 公的な支援制度は必ず**自治体の窓口**で確認。
`,
		BodyEN: `Disasters draw predatory sales. Door-to-door and phone scams spike.

## Common scams

- "Your roof is damaged" — high-pressure overpriced repairs.
- "We'll handle your insurance claim" — shady contractors.
- Fake donation pitches.

## Defence

- Never sign on the spot. Take a **business card and written estimate**, discuss with family.
- **Call 188** (National Consumer Affairs Center).
- Verify public aid through your **ward office** in person.
`,
	},

	// ── Heatwave ──────────────────────────────────────────────────────────
	{
		Title:        "熱中症の見分け方",
		TitleEN:      "Recognising heatstroke",
		DisasterType: "heatwave",
		Phase:        "during",
		Priority:     75,
		IsCritical:   true,
		Summary:      "軽症・中等症・重症のサイン。重症は119番。",
		Body: `## サインと対応

| レベル | 症状 | 対応 |
|---|---|---|
| 軽症 | めまい、立ちくらみ、筋肉痛 | 涼しい所で休む、水分と塩分補給 |
| 中等症 | 頭痛、吐き気、倦怠感 | 体を冷やす、経口補水液、受診 |
| 重症 | 意識障害、けいれん、高体温 | **119番**、救急搬送 |

## 冷やす場所

首の両側、**脇の下**、足の付け根 — 太い血管が通る場所を保冷剤などで。
`,
		BodyEN: `## Signs and response

| Severity | Signs | Action |
|---|---|---|
| Mild | Dizziness, muscle cramps | Cool area, water + electrolytes |
| Moderate | Headache, nausea, fatigue | Cool body, oral rehydration, see doctor |
| Severe | Confusion, seizure, high temp | **Call 119** now |

## Cool these spots

Both sides of the neck, **armpits**, groin — major blood vessels run near the surface.
`,
	},

	// ── Landslide ─────────────────────────────────────────────────────────
	{
		Title:        "土砂災害の前兆",
		TitleEN:      "Warning signs of a landslide",
		DisasterType: "landslide",
		Phase:        "before",
		Priority:     60,
		Summary:      "裂け目・濁り水・山鳴りを感じたら即避難。",
		Body: `大雨が続いた後や地震後は要注意。以下の**前兆**があれば即避難。

- 斜面に**亀裂**、小石がパラパラ落ちる。
- 湧き水が**急に止まる**/**濁る**。
- 山鳴り、異常な土の匂い。
- 木が傾く、建物がきしむ。

**傾斜地から離れた鉄筋コンクリート建物の2階以上**へ避難。
`,
		BodyEN: `Watch carefully after heavy rain or earthquakes. Any of these = **evacuate immediately**.

- Fresh **cracks** on a slope, small stones trickling down.
- Spring water suddenly **stops** or goes **muddy**.
- Low rumbling sound, unusual earth smell.
- Trees tilting, buildings creaking.

Move to the **2nd floor or higher of a reinforced-concrete building away from the slope**.
`,
	},

	// ── Storm surge ───────────────────────────────────────────────────────
	{
		Title:        "高潮への備え",
		TitleEN:      "Storm surge preparedness",
		DisasterType: "storm_surge",
		Phase:        "before",
		Priority:     50,
		Summary:      "台風+満潮+気圧低下で海面が数メートル上昇することも。",
		Body: `**高潮**は、台風の強風と気圧低下で海面が押し上げられる現象。**満潮**と重なると危険度が跳ね上がる。

東京湾では、伊勢湾台風クラスの台風が直撃すると**最大で5m級**の高潮が想定されている(江東5区など)。

## 対策

- 海抜の低い地域(江東・江戸川・葛飾・足立・墨田区など)は**早めの広域避難**。
- 家財道具は**2階以上**に上げる。
- 高潮特別警戒区域のハザードマップを必ず確認。
`,
		BodyEN: `A **storm surge** is seawater pushed up by typhoon winds and low pressure. When it coincides with **high tide**, risk multiplies.

A direct hit by an Ise-Bay-class typhoon could produce **5 m-class surge** in Tokyo Bay, especially in the five low-lying east Tokyo wards.

## Prep

- Low-elevation wards (Koto, Edogawa, Katsushika, Adachi, Sumida) need **early wide-area evacuation**.
- Move valuables **above the first floor**.
- Check the surge hazard map for your address.
`,
	},
}

func guideArticleSpec() SeedSpec {
	return SeedSpec{
		Model:       "guide_article",
		ModelKeyEnv: "CMS_GUIDE_MODEL_KEY",
		DedupField:  "title",
		Count:       len(guideArticles),
		Iter: func(i int) (string, []Field) {
			g := guideArticles[i]
			fields := []Field{
				{Key: "title", Type: typeText, Value: g.Title},
				{Key: "disaster_type", Type: typeSelect, Value: g.DisasterType},
				{Key: "phase", Type: typeSelect, Value: g.Phase},
				{Key: "priority", Type: typeInteger, Value: g.Priority},
				{Key: "body", Type: typeMarkdown, Value: g.Body},
				{Key: "is_critical", Type: typeBool, Value: g.IsCritical},
			}
			if g.TitleEN != "" {
				fields = append(fields, Field{Key: "title_en", Type: typeText, Value: g.TitleEN})
			}
			if g.BodyEN != "" {
				fields = append(fields, Field{Key: "body_en", Type: typeMarkdown, Value: g.BodyEN})
			}
			if g.Summary != "" {
				fields = append(fields, Field{Key: "summary", Type: typeTextArea, Value: g.Summary})
			}
			if g.IconKey != "" {
				fields = append(fields, Field{Key: "icon_key", Type: typeText, Value: g.IconKey})
			}
			return g.Title, fields
		},
	}
}

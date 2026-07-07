const test = require("node:test");
const assert = require("node:assert/strict");

const phase1 = require("../public/js/domain/phase1/phase1-closed-loop.js");

const majfuzaText = `[23:35, 09/06/2026] 旅行社 Majfuza Sultana: Sir please check  this
📌 Group Size : 10 adults + 1 kids age is 6
📌 Travrl date  12 July
📌 Duration : Kunming 3 Nights  + Chongquing 3 Nights + Chengdu 3 Nights
📌 Country - Bangladesh
🗓️ Proposed Itinerary
Day 1: Kunming Arrival. Then rail to Chongqing in the afternoon / Evening.
Day 2: Wulong Karst full day tour - Fairy mountain + Three natural bridges with English guide and entrance
Day 3: Chongqing city tour (Ciqikou + Liziba Station + Hongya Cave + Jiefangbei )
Day 4: Chongqing - Chengdu  by Rail.  Arrival Chengdu. 
Day 5: Arrange full day tour please suggest 
Day 6: Arrange full day tour please suggest 
Day 7: Chengdu - Kunming by Rail. Arrival Kunming.
Day 8: Stone forest full day
Day 9:  Kunming city tour  (Green Lake  Park + Flowers & Bird Market + Guandu Old Town)
Day 10: Airport Drop
Need transfer + sightseeing and entrance fee included.
No need hotel and train ticket
[23:37, 09/06/2026] 旅行社 Majfuza Sultana: I just need 2 days qoutation
day 2 and 3
With guide and without guide
Both rate needed`;

const evaText = `Hi Tayla,

Thank you for the itinerary.

Before proceeding, could you please send me the quotation for this program?

I am also considering a slightly different route and would like to compare both options.

Preferred itinerary:

- Beijing (3 nights)
- Xi'an (2 nights)
- Zhangjiajie (3 nights)
- Yangshuo/Guilin (3 nights)
- Shanghai (2 nights)

These are our must-see highlights:

Beijing:

- Great Wall (preferably Mutianyu)
- Forbidden City
- Tiananmen Square
- Summer Palace
- Temple of Heaven

Xi'an:

- Terracotta Warriors
- City Wall
- Muslim Quarter

Zhangjiajie:

- Avatar Mountains (Yuanjiajie)
- Bailong Elevator
- Tianzi Mountain
- Tianmen Mountain
- Heaven Gate
- Glass Bridge

Yangshuo / Guilin:

- Li River Cruise
- Yangshuo
- Yulong River
- Bamboo Raft Experience

Shanghai:

- The Bund
- Nanjing Road
- Old Town

We prefer to focus on the main highlights and avoid unnecessary shopping stops.

[21:36, 6/1/2026] 💕 Eva Pérez 西班牙旅行社: Yes, I would appreciate it if you could send me the quotation for this new itinerary so I can compare both options.`;

test("parses Majfuza phase 1 customer demand deterministically", () => {
  const result = phase1.parsePhase1DemandText(majfuzaText, { defaultYear: 2026 });

  assert.equal(result.actualCustomerName, "Majfuza Sultana");
  assert.equal(result.travelAgencyName, "孟加拉旅行社");
  assert.equal(result.clientCountry, "孟加拉国");
  assert.equal(result.source, "WeChat");
  assert.equal(result.startDate, "2026-07-12");
  assert.equal(result.serviceDays, 10);
  assert.equal(result.adults, 10);
  assert.equal(result.children, 1);
  assert.deepEqual(result.childAges, [6]);
  assert.deepEqual(result.cities, ["昆明", "重庆", "成都"]);
  assert.deepEqual(result.nightsByCity, { 昆明: 3, 重庆: 3, 成都: 3 });
  assert.equal(result.services.hotel, false);
  assert.equal(result.services.traffic, false);
  assert.equal(result.services.vehicle, true);
  assert.equal(result.services.ticket, true);
  assert.deepEqual(result.requiredGuideDays, [2]);
  assert.deepEqual(result.optionGuideDays, [2, 3]);
  assert.deepEqual(result.quoteOptions, ["withGuide", "withoutGuide"]);
});

test("extracts the ten day route and keeps travel cities", () => {
  const days = phase1.parseItineraryDays(majfuzaText, { defaultYear: 2026 });

  assert.equal(days.length, 10);
  assert.equal(days[0].date, "2026-07-12");
  assert.equal(days[1].city, "重庆");
  assert.match(days[1].detail, /Wulong Karst/i);
  assert.equal(days[3].city, "成都");
  assert.equal(days[6].city, "昆明");
  assert.equal(days[7].city, "昆明");
  assert.equal(days[9].city, "昆明");
});

test("extracts Eva multi-city English route into structured review data", () => {
  const result = phase1.parsePhase1DemandText(evaText, { defaultYear: 2026 });

  assert.equal(result.actualCustomerName, "Eva Pérez");
  assert.equal(result.travelAgencyName, "西班牙旅行社");
  assert.equal(result.clientCountry, "西班牙");
  assert.equal(result.serviceDays, 14);
  assert.deepEqual(result.cities, ["北京", "西安", "张家界", "桂林", "上海"]);
  assert.deepEqual(result.nightsByCity, { 北京: 3, 西安: 2, 张家界: 3, 桂林: 3, 上海: 2 });
  assert.equal(result.services.vehicle, true);
  assert.equal(result.services.ticket, true);
  assert.equal(result.services.hotel, true);
  assert.match(result.highlightsByCity["北京"].join(" "), /Mutianyu|Forbidden City/);
  assert.match(result.highlightsByCity["张家界"].join(" "), /Bailong Elevator|Glass Bridge/);
  assert.match(result.highlightsByCity["桂林"].join(" "), /Li River Cruise|Bamboo Raft/);
  assert.equal(result.itineraryDays.length, 5);
  assert.equal(result.itineraryDays[0].city, "北京");
  assert.equal(result.itineraryDays[4].city, "上海");
});

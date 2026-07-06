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

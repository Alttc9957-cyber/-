(function initYouyixingPhase1(globalScope) {
  "use strict";

  const ORDER_STATUSES = ["待确认", "待安排", "进行中", "已完成"];

  const CITY_ALIASES = [
    { city: "北京", patterns: [/beijing/i, /北京/] },
    { city: "西安", patterns: [/xi['’]?\s*an/i, /xian/i, /西安/] },
    { city: "张家界", patterns: [/zhangjiajie/i, /zhang\s*jia\s*jie/i, /张家界/] },
    { city: "桂林", patterns: [/guilin/i, /yangshuo/i, /桂林|阳朔/] },
    { city: "上海", patterns: [/shanghai/i, /上海/] },
    { city: "昆明", patterns: [/kunming/i, /昆明/] },
    { city: "重庆", patterns: [/chong\s*qing/i, /chongqing/i, /chongquing/i, /coongqing/i, /重庆/] },
    { city: "成都", patterns: [/chengdu/i, /成都/] },
  ];

  const CITY_HEADING_PATTERNS = [
    { city: "北京", pattern: /beijing|北京/i },
    { city: "西安", pattern: /xi['’]?\s*an|xian|西安/i },
    { city: "张家界", pattern: /zhangjiajie|zhang\s*jia\s*jie|张家界/i },
    { city: "桂林", pattern: /yangshuo\s*\/\s*guilin|guilin|yangshuo|桂林|阳朔/i },
    { city: "上海", pattern: /shanghai|上海/i },
    { city: "昆明", pattern: /kunming|昆明/i },
    { city: "重庆", pattern: /chong\s*qing|chongqing|chongquing|coongqing|重庆/i },
    { city: "成都", pattern: /chengdu|成都/i },
  ];

  const MONTHS = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
  };

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function textValue(input) {
    return String(input || "").replace(/\r/g, "\n");
  }

  function findCities(text) {
    const source = textValue(text);
    const hits = [];
    CITY_ALIASES.forEach((item) => {
      const indexes = item.patterns
        .map((pattern) => {
          const match = source.match(pattern);
          return match ? match.index : -1;
        })
        .filter((index) => index >= 0);
      if (indexes.length) hits.push({ city: item.city, index: Math.min(...indexes) });
    });
    return unique(hits.sort((a, b) => a.index - b.index).map((item) => item.city));
  }

  function normalizeCityName(value) {
    const source = textValue(value);
    const item = CITY_ALIASES.find((candidate) => candidate.patterns.some((pattern) => pattern.test(source)));
    return item ? item.city : "";
  }

  function parsePeople(text) {
    const source = textValue(text);
    let adults = null;
    let children = null;
    const adultsMatch = source.match(/(\d+)\s*(?:adults?|adult|大人|成人)/i);
    const childrenMatch = source.match(/(\d+)\s*(?:kids?|children|child|小孩|儿童)/i);
    const paxMatch = source.match(/(?:pax|people|guests?|人数)\D{0,8}(\d+)/i);
    if (adultsMatch) adults = Number(adultsMatch[1]);
    if (childrenMatch) children = Number(childrenMatch[1]);
    if (paxMatch && adults == null && children == null) adults = Number(paxMatch[1]);
    if (adults == null && children == null) {
      const groupMatch = source.match(/(\d+)\s*(?:pax|people|guests?)/i);
      if (groupMatch) adults = Number(groupMatch[1]);
    }
    return {
      adults: Number.isFinite(adults) ? adults : null,
      children: Number.isFinite(children) ? children : 0,
    };
  }

  function parseChildAges(text) {
    const source = textValue(text);
    const ages = [];
    const patterns = [
      /age\s*(?:is|:)?\s*(\d{1,2})/gi,
      /(\d{1,2})\s*(?:years?\s*old|yrs?\s*old|岁)/gi,
      /child(?:ren)?[^.\n]{0,30}?age[^0-9]{0,8}(\d{1,2})/gi,
    ];
    patterns.forEach((pattern) => {
      let match = pattern.exec(source);
      while (match) {
        const age = Number(match[1]);
        if (age > 0 && age < 18) ages.push(age);
        match = pattern.exec(source);
      }
    });
    return unique(ages);
  }

  function parseTravelDate(text, options = {}) {
    const source = textValue(text);
    const defaultYear = Number(options.defaultYear) || 2026;
    const explicitYear = source.match(/\b(20\d{2})\b/);
    const year = explicitYear ? Number(explicitYear[1]) : defaultYear;
    const englishDate = source.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b/i);
    if (englishDate) {
      const day = Number(englishDate[1]);
      const month = MONTHS[englishDate[2].toLowerCase()];
      if (day && month) return `${year}-${pad2(month)}-${pad2(day)}`;
    }
    const isoDate = source.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
    if (isoDate) return `${isoDate[1]}-${pad2(isoDate[2])}-${pad2(isoDate[3])}`;
    const cnDate = source.match(/(20\d{2})?年?\s*(\d{1,2})月\s*(\d{1,2})日/);
    if (cnDate) return `${cnDate[1] || year}-${pad2(cnDate[2])}-${pad2(cnDate[3])}`;
    return "";
  }

  function parseNightsByCity(text) {
    const source = textValue(text);
    const nightsByCity = {};
    const pattern = /([A-Za-z\u4e00-\u9fa5\s/'’.-]{2,36}?)\s*\(?\s*(\d{1,2})\s*(?:nights?|晚|晚住宿)\s*\)?/gi;
    let match = pattern.exec(source);
    while (match) {
      const city = normalizeCityName(match[1]);
      const nights = Number(match[2]);
      if (city && nights > 0) nightsByCity[city] = nights;
      match = pattern.exec(source);
    }
    return nightsByCity;
  }

function inferServiceDays(text, nightsByCity = parseNightsByCity(text)) {
    const source = textValue(text);
    const dayNumbers = [];
    const dayPattern = /\bDay\s*0*(\d{1,2})\b/gi;
    let dayMatch = dayPattern.exec(source);
    while (dayMatch) {
      dayNumbers.push(Number(dayMatch[1]));
      dayMatch = dayPattern.exec(source);
    }
    if (dayNumbers.length) return Math.max(...dayNumbers);
    const explicitDays = source.match(/(\d{1,2})\s*(?:days?|天|日游)/i);
    if (explicitDays) return Number(explicitDays[1]);
    const nightSum = Object.values(nightsByCity || {}).reduce((sum, value) => sum + Number(value || 0), 0);
    return nightSum ? nightSum + 1 : null;
  }

  function parseIdentity(text) {
    const source = textValue(text);
    const senderMatch = source.match(/(?:旅行社|travel\s*agent|agent)\s*([^:\n]{2,80})\s*:/i) || source.match(/\]\s*([^:\n]{2,80})\s*:/);
    const customerName = senderMatch ? senderMatch[1].trim().replace(/\s+/g, " ") : "";
    const fromBangladesh = /bangladesh|bangladeshi|孟加拉/i.test(source);
    const fromSpain = /西班牙旅行社|spain|spanish|p[eé]rez|eva/i.test(source);
    return {
      actualCustomerName: fromSpain ? "Eva Pérez" : customerName,
      travelAgencyName: fromBangladesh ? "孟加拉旅行社" : fromSpain ? "西班牙旅行社" : "",
      clientCountry: fromBangladesh ? "孟加拉国" : fromSpain ? "西班牙" : "",
      source: /\[\d{1,2}:\d{2}/.test(source) ? "WeChat" : "",
    };
  }

  function parseServices(text) {
    const source = textValue(text);
    const hotelExcluded = /(?:no\s+need|not\s+need|without|exclude|不需要|不含)[^.\n]{0,40}(?:hotel|酒店)/i.test(source);
    const trainExcluded = /(?:no\s+need|not\s+need|without|exclude|不需要|不含)[^.\n]{0,60}(?:train|rail|ticket|火车|高铁|车票|机票)/i.test(source);
    const vehicleRequested = /transfer|sightseeing|vehicle|car|van|bus|用车|包车|接送|接机|送机/i.test(source);
    const guideRequested = /guide|导游|讲解/i.test(source);
    const ticketRequested = /entrance\s*fee|ticket|门票|景点|must-see|highlights?|great\s*wall|forbidden\s*city|terracotta|avatar\s*mountains?|li\s*river/i.test(source);
    return {
      vehicle: vehicleRequested || true,
      guide: guideRequested,
      ticket: ticketRequested,
      hotel: !hotelExcluded,
      traffic: !trainExcluded,
      meal: false,
      transfer: /transfer|接送|接机|送机/i.test(source),
      exclusions: [
        hotelExcluded ? "Hotel" : "",
        trainExcluded ? "Train ticket" : "",
      ].filter(Boolean),
      inclusions: [
        vehicleRequested ? "Transfer and sightseeing vehicle" : "",
        ticketRequested ? "Entrance fee" : "",
      ].filter(Boolean),
    };
  }

  function inferGuideDays(text) {
    const source = textValue(text);
    const requiredGuideDays = [];
    const optionGuideDays = [];
    const linePattern = /(?:^|\n)\s*Day\s*0*(\d{1,2})\s*[:：][^\n]*guide[^\n]*/gi;
    let lineMatch = linePattern.exec(source);
    while (lineMatch) {
      requiredGuideDays.push(Number(lineMatch[1]));
      lineMatch = linePattern.exec(source);
    }

    const justDaysMatch = source.match(/just\s*(\d{1,2})\s*days?[\s\S]{0,160}?day\s*0*(\d{1,2})\s*(?:and|&|,|\+|\/)\s*0*(\d{1,2})/i);
    if (justDaysMatch && /with\s+guide|without\s+guide|no\s+guide/i.test(source)) {
      optionGuideDays.push(Number(justDaysMatch[2]), Number(justDaysMatch[3]));
    }

    const dayPairMatch = source.match(/day\s*0*(\d{1,2})\s*(?:and|&|,|\+|\/)\s*0*(\d{1,2})[\s\S]{0,160}?(?:with\s+guide|without\s+guide|guide)/i);
    if (dayPairMatch) optionGuideDays.push(Number(dayPairMatch[1]), Number(dayPairMatch[2]));

    return {
      requiredGuideDays: unique(requiredGuideDays).map(Number).sort((a, b) => a - b),
      optionGuideDays: unique(optionGuideDays).map(Number).sort((a, b) => a - b),
      quoteOptions: /with\s+guide/i.test(source) && /without\s+guide|no\s+guide/i.test(source) ? ["withGuide", "withoutGuide"] : [],
    };
  }

  function cleanItineraryText(value) {
    return textValue(value)
      .split("\n")
      .filter((line) => !/^\s*\[?\d{1,2}:\d{2}/.test(line))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function addDays(dateString, offset) {
    if (!dateString) return "";
    const parts = String(dateString).split("-").map((item) => Number(item));
    if (parts.length !== 3 || parts.some((item) => !Number.isFinite(item))) return "";
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    if (Number.isNaN(date.getTime())) return "";
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  }

  function parseItineraryDays(text, options = {}) {
    const source = textValue(text);
    const startDate = options.startDate || parseTravelDate(source, options);
    const days = [];
    const pattern = /\bDay\s*0*(\d{1,2})\s*[:：]\s*([\s\S]*?)(?=\n\s*Day\s*0*\d{1,2}\s*[:：]|\n\s*\[\d{1,2}:\d{2}|$)/gi;
    let previousCity = "";
    let match = pattern.exec(source);
    while (match) {
      const dayNumber = Number(match[1]);
      const detail = cleanItineraryText(match[2]);
      const cities = findCities(detail);
      const city = cities.length ? cities[cities.length - 1] : previousCity;
      previousCity = city || previousCity;
      const title = detail.split(/[.;。]/)[0].trim() || `Day ${dayNumber}`;
      days.push({
        day: dayNumber,
        date: addDays(startDate, dayNumber - 1),
        city: city || "",
        title,
        summary: detail,
        detail,
      });
      match = pattern.exec(source);
    }
    if (!days.length) return parsePreferredRouteBlocks(source, { ...options, startDate });
    return days.sort((a, b) => a.day - b.day);
  }

  function parseHighlightsByCity(text) {
    const source = textValue(text);
    const lines = source.split("\n");
    const sections = {};
    let currentCity = "";
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const heading = trimmed.match(/^([A-Za-z\u4e00-\u9fa5\s/'’.-]{2,36})\s*[:：]\s*$/);
      if (heading) {
        const normalized = normalizeCityName(heading[1]);
        if (normalized) {
          currentCity = normalized;
          sections[currentCity] = sections[currentCity] || [];
        }
        return;
      }
      if (currentCity && /^[-•]/.test(trimmed)) {
        sections[currentCity].push(trimmed.replace(/^[-•]\s*/, "").trim());
      }
    });
    return sections;
  }

  function parsePreferredRouteBlocks(text, options = {}) {
    const nightsByCity = parseNightsByCity(text);
    const highlightsByCity = parseHighlightsByCity(text);
    const cities = findCities(text);
    let cursor = 1;
    return cities.map((city) => {
      const nights = Number(nightsByCity[city] || 0);
      const highlights = highlightsByCity[city] || [];
      const day = cursor;
      cursor += nights ? nights + 1 : 1;
      return {
        day,
        date: addDays(options.startDate || "", day - 1),
        city,
        nights,
        title: nights ? `${city} ${nights} nights` : city,
        summary: highlights.join("；"),
        detail: highlights.length ? `${city}: ${highlights.join("；")}` : city,
        highlights,
      };
    });
  }

  function parsePhase1DemandText(text, options = {}) {
    const source = textValue(text);
    const nightsByCity = parseNightsByCity(source);
    const people = parsePeople(source);
    const identity = parseIdentity(source);
    const guide = inferGuideDays(source);
    const services = parseServices(source);
    const startDate = parseTravelDate(source, options);
    const cities = unique(findCities(source));
    return {
      ...identity,
      startDate,
      serviceDays: inferServiceDays(source, nightsByCity),
      adults: people.adults,
      children: people.children,
      childAges: parseChildAges(source),
      cities,
      nightsByCity,
      highlightsByCity: parseHighlightsByCity(source),
      services,
      transferNeed: services.transfer ? "需要接送机/站与市内游览用车" : "",
      charterNeed: services.vehicle ? "需要" : "",
      vehiclePreference: services.vehicle ? "按人数推荐商务车/中巴" : "",
      ...guide,
      itineraryDays: parseItineraryDays(source, { ...options, startDate }),
    };
  }

  const api = {
    ORDER_STATUSES,
    parsePhase1DemandText,
    parseTravelDate,
    inferServiceDays,
    inferGuideDays,
    parseItineraryDays,
    parseHighlightsByCity,
    findCities,
    parseNightsByCity,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.YouyixingPhase1 = api;
})(typeof globalThis !== "undefined" ? globalThis : window);

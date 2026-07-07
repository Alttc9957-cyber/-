(function initYouyixingAttractionMatching(globalScope) {
  const englishAttractionAliases = [
    ["Forbidden City", "故宫博物院"],
    ["Palace Museum", "故宫博物院"],
    ["Tiananmen Square", "天安门广场"],
    ["Summer Palace", "颐和园"],
    ["Temple of Heaven", "天坛公园"],
    ["Terracotta Warriors", "兵马俑"],
    ["Badaling Great Wall", "八达岭长城"],
    ["Mutianyu Great Wall", "慕田峪长城"],
    ["Great Wall", "长城"],
    ["Yu Garden", "豫园"],
    ["The Bund", "外滩"],
    ["Nanjing Road", "南京路"],
    ["Oriental Pearl Tower", "东方明珠塔"],
  ];

  const attractionAliases = {
    故宫博物院: ["故宫", "故官", "故宫博物馆", "紫禁城", "Forbidden City", "Palace Museum"],
    天安门广场: ["天安门", "Tiananmen Square"],
    天坛公园: ["天坛", "Temple of Heaven"],
    景山公园: ["景山"],
    东方明珠塔: ["东方明珠", "Oriental Pearl Tower"],
    八达岭长城: ["八达岭", "八达岭长城"],
    慕田峪长城: ["慕田峪", "慕田峪长城"],
    长城: ["Great Wall"],
  };

  const nonTicketAttractions = [
    "天安门广场",
    "外滩",
    "南京路",
    "南京东路",
    "陆家嘴",
    "胡同",
    "回民街",
    "锦里",
    "宽窄巷子",
    "洪崖洞",
    "解放碑",
  ];

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeTicketText(value) {
    return String(value || "").replace(/\s+/g, "").replace(/[（）()《》“”"']/g, "");
  }

  function standardizeEnglishAttractions(text) {
    let result = String(text || "");
    englishAttractionAliases
      .slice()
      .sort((a, b) => b[0].length - a[0].length)
      .forEach(([alias, standard]) => {
        result = result.replace(new RegExp(`\\b${escapeRegExp(alias)}\\b`, "gi"), standard);
      });
    return result;
  }

  function standardAttractionForName(name) {
    const normalized = normalizeTicketText(name);
    const direct = Object.keys(attractionAliases).find((standard) => normalizeTicketText(standard) === normalized);
    if (direct) return direct;
    const found = Object.entries(attractionAliases).find(([standard, aliases]) => {
      const group = [standard, ...aliases].map(normalizeTicketText);
      return group.some((item) => item === normalized);
    });
    return found ? found[0] : String(name || "").trim();
  }

  function standardizeAttractionText(text) {
    let result = standardizeEnglishAttractions(text);
    Object.entries(attractionAliases)
      .sort((a, b) => b[0].length - a[0].length)
      .forEach(([standard, aliases]) => {
        aliases
          .slice()
          .sort((a, b) => b.length - a.length)
          .forEach((alias) => {
            if (/^[\x00-\x7F]+$/.test(alias)) return;
            result = result.replace(new RegExp(escapeRegExp(alias), "g"), standard);
          });
      });
    return result;
  }

  function ticketAliases(name) {
    const standard = standardAttractionForName(name);
    const aliases = attractionAliases[standard] || [];
    return Array.from(new Set([standard, ...aliases, name].filter(Boolean)));
  }

  function sameTicketName(a, b) {
    const leftGroup = ticketAliases(a).map(normalizeTicketText);
    const rightGroup = ticketAliases(b).map(normalizeTicketText);
    return leftGroup.some((left) => rightGroup.some((right) => left === right || left.includes(right) || right.includes(left)));
  }

  function isFreeLandmark(name) {
    const standard = standardAttractionForName(name);
    const normalized = normalizeTicketText(standard);
    return nonTicketAttractions.some((item) => normalizeTicketText(item) === normalized);
  }

  function isTransferOnlyDayText(text = "") {
    const value = String(text || "");
    if (!/抵达|到达|接机|送机|机场|接站|送站|入住|酒店|办理入住|自由活动|休息/.test(value)) return false;
    return !/故宫|长城|兵马俑|古城墙|外滩|豫园|森林公园|天门山|熊猫|博物馆|景区|游览|参观|一日游|市内|市区|武隆|颐和园|天坛|景山|门票/.test(value);
  }

  const api = {
    englishAttractionAliases,
    attractionAliases,
    nonTicketAttractions,
    normalizeTicketText,
    standardizeEnglishAttractions,
    standardizeAttractionText,
    standardAttractionForName,
    ticketAliases,
    sameTicketName,
    isFreeLandmark,
    isTransferOnlyDayText,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingAttractionMatching = api;
})(typeof window !== "undefined" ? window : globalThis);

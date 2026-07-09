(function initYouyixingVehicleRecommendation(globalScope) {
  function asNumber(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function recommendVehiclePlan(input = {}) {
    const count = asNumber(input.people);
    const hasGuide = Boolean(input.hasGuide);
    const hasDriver = input.hasDriver !== false;
    const serviceDays = asNumber(input.serviceDays);
    const luggage = input.luggage || (serviceDays >= 7 ? "多" : "未知");
    const preference = input.preference || "经济";
    if (count <= 0) return { vehicleType: "", reason: "人数未确认，暂不推荐车型。", seatsNeeded: 0, luggage, preference, serviceDays };

    const seatsNeeded = count + (hasGuide ? 1 : 0) + (hasDriver ? 1 : 0);
    const needsLuggageSpace = luggage === "多" || serviceDays >= 7;
    let vehicleType = "";
    if (count <= 2) vehicleType = hasGuide || needsLuggageSpace || preference === "舒适" || preference === "商务" ? "7座车" : "5座车";
    else if (count <= 4) vehicleType = hasGuide || needsLuggageSpace || preference === "舒适" || preference === "商务" ? "7座车" : "5座车";
    else if (count <= 6) vehicleType = needsLuggageSpace ? "14座车" : "9座车";
    else if (count <= 10) vehicleType = "14座车";
    else if (count <= 13) vehicleType = "17座车";
    else vehicleType = "22座车";
    if (count >= 14) vehicleType = "22座车或多车方案";

    const parts = [
      `${count} 位客人`,
      hasDriver ? "司机" : "",
      hasGuide ? "导游" : "",
      serviceDays >= 7 ? `${serviceDays}天长线行李空间` : "",
      luggage === "多" && serviceDays < 7 ? "行李较多" : "",
    ].filter(Boolean);
    const reason = `推荐车型：${vehicleType}。推荐原因：${parts.join(" + ")}，合计至少 ${seatsNeeded} 个座位需求${vehicleType === "5座车" && seatsNeeded >= 4 ? "；5 座空间偏紧，舒适报价建议 7 座车" : ""}。`;
    return { vehicleType, reason, seatsNeeded, luggage, preference, serviceDays };
  }

  const api = { recommendVehiclePlan };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingVehicleRecommendation = api;
})(typeof window !== "undefined" ? window : globalThis);

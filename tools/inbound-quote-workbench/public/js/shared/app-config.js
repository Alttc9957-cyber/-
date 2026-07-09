(function initYouyixingAppConfig(globalScope) {
  const serviceOrder = ["vehicle", "ticket", "experience", "guide", "hotel", "meal", "traffic", "other"];
  const serviceLabels = {
    vehicle: "用车",
    ticket: "景点门票",
    experience: "特色体验",
    guide: "导游",
    hotel: "酒店",
    meal: "餐",
    traffic: "大交通",
    other: "其他",
  };

  const productCategories = ["全部", "景点门票", "酒店", "用车", "导游", "餐厅", "特色体验", "大交通", "其他", "线路产品"];
  const supplierCategories = ["全部", "酒店", "包车", "导游", "门票", "大交通", "餐", "特色体验", "其他"];
  const productStatusOptions = ["可报价", "缺成本", "缺供应商", "待清洗", "停用"];
  const productFieldTypes = ["文本", "数字", "金额", "日期", "单选", "多选", "布尔值", "备注"];

  const cityCoordinates = {
    北京: [39.9042, 116.4074],
    上海: [31.2304, 121.4737],
    西安: [34.3416, 108.9398],
    广州: [23.1291, 113.2644],
    深圳: [22.5431, 114.0579],
    杭州: [30.2741, 120.1551],
    苏州: [31.2989, 120.5853],
    成都: [30.5728, 104.0668],
    重庆: [29.563, 106.5516],
    桂林: [25.2736, 110.2900],
    张家界: [29.1171, 110.4792],
    昆明: [25.0389, 102.7183],
    丽江: [26.8721, 100.2296],
    大理: [25.6065, 100.2676],
  };

  const extraRouteCities = [
    "南京", "洛阳", "青岛", "厦门", "武汉", "长沙", "天津", "郑州", "开封", "济南",
    "曲阜", "泰安", "哈尔滨", "长春", "沈阳", "大连", "丹东", "延吉", "漠河",
    "太原", "大同", "平遥", "呼和浩特", "包头", "银川", "西宁", "兰州", "敦煌",
    "张掖", "嘉峪关", "酒泉", "乌鲁木齐", "吐鲁番", "喀什", "伊犁", "库车",
    "宁波", "绍兴", "无锡", "扬州", "镇江", "合肥", "黄山", "福州", "泉州",
    "南昌", "九江", "宜昌", "台州", "温州", "珠海", "佛山", "东莞", "三亚",
    "海口", "南宁", "北海", "贵阳", "遵义", "安顺", "荔波", "乐山", "峨眉山",
    "阳朔", "贵州", "云南", "西双版纳", "景洪", "腾冲", "保山", "普洱", "香格里拉",
  ];

  const routeCityAliases = {
    beijing: "北京",
    shanghai: "上海",
    xian: "西安",
    "xi'an": "西安",
    "xi an": "西安",
    chengdu: "成都",
    chongqing: "重庆",
    guangzhou: "广州",
    shenzhen: "深圳",
    hangzhou: "杭州",
    suzhou: "苏州",
    guilin: "桂林",
    zhangjiajie: "张家界",
    kunming: "昆明",
    lijiang: "丽江",
    dali: "大理",
    nanjing: "南京",
    luoyang: "洛阳",
    qingdao: "青岛",
    xiamen: "厦门",
    wuhan: "武汉",
    changsha: "长沙",
    tianjin: "天津",
    zhengzhou: "郑州",
    kaifeng: "开封",
    jinan: "济南",
    qufu: "曲阜",
    taian: "泰安",
    harbin: "哈尔滨",
    datong: "大同",
    pingyao: "平遥",
    huangshan: "黄山",
    leshan: "乐山",
    yichang: "宜昌",
    qinghai: "青海",
    dunhuang: "敦煌",
    urumqi: "乌鲁木齐",
    kashgar: "喀什",
    xishuangbanna: "西双版纳",
    guizhou: "贵州",
    yunnan: "云南",
    yangshuo: "阳朔",
    shangrila: "香格里拉",
    "shangri-la": "香格里拉",
  };

  const categoryToType = {
    用车: "vehicle",
    包车: "vehicle",
    景点门票: "ticket",
    门票: "ticket",
    特色体验: "experience",
    导游: "guide",
    酒店: "hotel",
    餐: "meal",
    大交通: "traffic",
    其他: "other",
  };

  const typeToCategory = {
    vehicle: "用车",
    ticket: "景点门票",
    experience: "特色体验",
    guide: "导游",
    hotel: "酒店",
    meal: "餐",
    traffic: "大交通",
    other: "其他",
  };

  const supplierCategoryMeta = {
    用车: {
      fields: ["城市", "供应商类型", "供应商名字", "车型", "报价", "营业执照", "交通许可证", "银行支付信息"],
      costHeaders: ["车辆/服务", "服务城市", "单位", "基础成本", "司机餐住", "有效期"],
    },
    景点门票: {
      fields: ["景区范围", "票种", "预约方式", "退改规则"],
      costHeaders: ["景点/票种", "城市", "成人成本", "儿童成本", "有效期", "状态"],
    },
    特色体验: {
      fields: ["体验类型", "体验时间", "图片/链接", "预约规则"],
      costHeaders: ["体验名称", "城市", "票种", "成人成本", "儿童成本", "状态"],
    },
    导游: {
      fields: ["语种", "服务城市", "导游资质", "是否含餐"],
      costHeaders: ["导游服务", "城市", "语种", "服务费", "有效期", "状态"],
    },
    酒店: {
      fields: ["酒店星级", "房型", "早餐", "取消政策"],
      costHeaders: ["酒店/档位", "城市", "房型", "单房成本", "有效期", "状态"],
    },
    餐: {
      fields: ["餐标", "菜系", "特殊餐", "团队接待"],
      costHeaders: ["餐食", "城市", "单位", "成人成本", "儿童成本", "状态"],
    },
    大交通: {
      fields: ["票务渠道", "出票服务费", "退改规则", "覆盖线路"],
      costHeaders: ["交通类型", "城市/线路", "单位", "成本", "有效期", "状态"],
    },
    其他: {
      fields: ["服务内容", "适用场景", "计价方式", "备注"],
      costHeaders: ["服务内容", "城市", "单位", "成本", "有效期", "状态"],
    },
  };

  const feishuProductImportSummary = {
    sourceFile: "产品库汇总.xlsx",
    importedAt: "2026-06-21",
    counts: {
      routes: 24,
      vehicles: 920,
      experiences: 69,
      tickets: 113,
      guides: 48,
      hotels: 153,
      meals: 151,
    },
    resourceCounts: {
      vehicle: 920,
      guide: 48,
      experience: 61,
      ticket: 111,
      hotel: 148,
    },
  };

  const dailyRates = {
    CNY: { label: "人民币", rate: 1, symbol: "¥" },
    USD: { label: "美元", rate: 7.2, symbol: "$" },
    EUR: { label: "欧元", rate: 7.8, symbol: "€" },
    AED: { label: "迪拉姆", rate: 1.96, symbol: "AED " },
  };

  const api = {
    serviceOrder,
    serviceLabels,
    productCategories,
    supplierCategories,
    productStatusOptions,
    productFieldTypes,
    cityCoordinates,
    extraRouteCities,
    routeCityAliases,
    categoryToType,
    typeToCategory,
    supplierCategoryMeta,
    feishuProductImportSummary,
    dailyRates,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingAppConfig = api;
})(typeof window !== "undefined" ? window : globalThis);

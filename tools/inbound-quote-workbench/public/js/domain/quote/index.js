(function initYouyixingQuoteDomain(globalScope) {
  const modules = typeof require === "function"
    ? {
        types: require("./quote-types.js"),
        warnings: require("./quote-warnings.js"),
        normalizer: require("./quote-requirement-normalizer.js"),
        candidates: require("./quote-candidate-builder.js"),
        lines: require("./quote-line-builder.js"),
        versions: require("./quote-version-builder.js"),
        display: require("./quote-display.js"),
      }
    : {
        types: globalScope.YouyixingQuoteTypes || {},
        warnings: globalScope.YouyixingQuoteWarnings || {},
        normalizer: globalScope.YouyixingQuoteRequirementNormalizer || {},
        candidates: globalScope.YouyixingQuoteCandidateBuilder || {},
        lines: globalScope.YouyixingQuoteLineBuilder || {},
        versions: globalScope.YouyixingQuoteVersionBuilder || {},
        display: globalScope.YouyixingQuoteDisplay || {},
      };
  const api = Object.assign({}, modules.types, modules.warnings, modules.normalizer, modules.candidates, modules.lines, modules.versions, modules.display);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingQuoteDomain = api;
})(typeof window !== "undefined" ? window : globalThis);

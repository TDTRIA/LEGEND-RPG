/* LEGEND v0.20.36 - shared HTML text escaping.
 * Use only for values inserted into HTML text/quoted attribute contexts; this is not
 * a sanitizer for arbitrary HTML or URL validation.
 */
(() => {
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[character]));
  }

  window.LegendHtmlV120 = Object.freeze({ escapeHtml });
})();

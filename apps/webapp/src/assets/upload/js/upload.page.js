(function () {
  htmx.on("#form", "htmx:xhr:progress", function (evt) {
    htmx
      .find("#progress")
      .setAttribute("value", (evt.detail.loaded / evt.detail.total) * 100);
  });

  htmx.on("#form", "htmx:afterRequest", function (evt) {
    this.reset();
  });
})();

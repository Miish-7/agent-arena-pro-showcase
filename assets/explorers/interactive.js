/* Read-only local exhibit selectors. All evidence is included in the document. */
(() => {
  "use strict";
  function install(root) {
    const select = root.querySelector("[data-ax-switch]");
    const panels = [...root.querySelectorAll("[data-ax-panel]")];
    const buttons = [...root.querySelectorAll("[data-ax-view]")];
    function show(key) {
      const target = panels.find((panel) => panel.dataset.axPanel === key) || panels[0];
      panels.forEach((panel) => { panel.hidden = panel !== target; });
      buttons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.axView === target.dataset.axPanel));
      });
      select.value = target.dataset.axPanel;
    }
    function navigate(key) {
      if (location.hash.slice(1) !== key) location.hash = key;
      show(key);
    }
    buttons.forEach((button) => button.addEventListener("click", () => navigate(button.dataset.axView)));
    select.addEventListener("change", () => navigate(select.value));
    window.addEventListener("hashchange", () => show(location.hash.slice(1)));
    show(location.hash.slice(1));

    root.querySelectorAll("[data-ax-group]").forEach((group) => {
      const choices = [...group.querySelectorAll("[data-ax-choice]")];
      const items = [...group.querySelectorAll("[data-ax-item]")];
      choices.forEach((choice) => choice.addEventListener("click", () => {
        choices.forEach((other) => other.setAttribute("aria-pressed", String(other === choice)));
        items.forEach((item) => { item.hidden = item.dataset.axItem !== choice.dataset.axChoice; });
      }));
    });
    root.querySelectorAll("[data-ax-timeline]").forEach((timeline) => {
      const search = timeline.querySelector("[data-ax-search]");
      const filter = timeline.querySelector("[data-ax-filter]");
      const count = timeline.querySelector("[data-ax-count]");
      const empty = timeline.querySelector("[data-ax-empty]");
      const entries = [...timeline.querySelectorAll("[data-ax-event]")];
      const normalize = (value) => value.normalize("NFKD").toLowerCase().replace(/\p{M}/gu, "").replace(/ـ/g, "").trim();
      const texts = entries.map((entry) => normalize(entry.textContent));
      function update() {
        const needle = normalize(search.value);
        let matches = 0;
        entries.forEach((entry, i) => {
          const hit = (filter.value === "all" || entry.dataset.axEvent === filter.value) && texts[i].includes(needle);
          entry.hidden = !hit;
          if (hit) matches++;
        });
        count.textContent = count.dataset.template.replace("#", new Intl.NumberFormat(document.documentElement.lang).format(matches));
        empty.hidden = matches > 0;
      }
      filter.addEventListener("change", update);
      search.addEventListener("input", update);
      update();
    });
  }
  document.querySelectorAll("[data-ax-root]").forEach(install);
})();

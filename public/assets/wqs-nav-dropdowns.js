(function () {
  const products = [
    ["All Products", "/products/"],
    ["Axial Piston Pumps", "/products/axial-piston-pumps/"],
    ["Water Hydraulic Motors", "/products/water-hydraulic-motors/"],
    ["Water Hydraulic Cylinders", "/products/water-hydraulic-cylinders/"],
    ["Water Hydraulic Valves", "/products/water-hydraulic-valves/"],
    ["Water Hydraulics HPUs", "/products/water-hydraulics-hpu/"],
    ["Fire Suppression Pumps", "/products/axial-piston-fire-pumps/"],
    ["Power Centre", "/products/power-centre-reverse-osmosis/"],
    ["Modular Desalination Packages", "/r2-modular-desalination-packages/"],
    ["WQS Stainless", "/wqs-stainless/"]
  ];

  const industries = [
    ["All Industries", "/industries/"],
    ["Municipal Infrastructure", "/industries/water-hydraulics-for-municipal-infrastructure/"],
    ["Marine and Coastal", "/industries/water-hydraulics-for-marine-and-coastal-applications/"],
    ["Mining Operations", "/industries/water-hydraulics-for-mining-operations/"],
    ["Food and Beverage", "/industries/water-hydraulics-for-food-and-beverage-manufacturing/"],
    ["Fire Suppression Systems", "/industries/water-hydraulics-for-fire-suppression-systems/"],
    ["Hydroelectric Power", "/industries/water-hydraulics-for-hydroelectric-power/"],
    ["Water Parks and Aquatic Facilities", "/industries/water-hydraulics-for-water-parks-and-wave-pools/"],
    ["Dust Control", "/industries/water-hydraulics-for-dust-control-systems/"],
    ["Odour Control", "/industries/water-hydraulics-for-odor-control-and-ventilation-systems/"],
    ["Agriculture and Irrigation", "/industries/water-hydraulics-for-agriculture-and-irrigation-systems/"],
    ["Desalination", "/industries/water-hydraulics-for-desalination-and-reverse-osmosis-systems/"],
    ["Hydrogen Production", "/industries/water-hydraulic-systems-for-hydrogen-production/"],
    ["Forestry and Wood Processing", "/industries/water-hydraulics-for-forestry-and-logging-operations/"],
    ["Wastewater Treatment", "/industries/water-hydraulic-systems-for-wastewater-treatment-plants/"],
    ["Pulp and Paper Mills", "/industries/water-hydraulic-systems-for-pulp-and-paper-mills/"]
  ];

  function siteRoot() {
    const script = document.currentScript;
    if (script && script.src) return new URL("../", script.src);
    return new URL("./", window.location.href);
  }

  function makeHref(path) {
    return new URL(path, siteRoot()).href;
  }

  function findNavLink(label) {
    const links = Array.from(document.querySelectorAll("nav .nav-links a, nav .wq-nav-links a, nav .links a, header .links a, .site-header .links a"));
    return links.find((link) => link.textContent.trim().toLowerCase() === label);
  }

  function buildMenu(items, type) {
    const menu = document.createElement("ul");
    menu.className = "nav-dropdown-menu";
    menu.dataset.menu = type;
    items.forEach(([label, path]) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = makeHref(path);
      link.textContent = label;
      item.appendChild(link);
      menu.appendChild(item);
    });
    return menu;
  }

  function enhance(label, items, type) {
    const link = findNavLink(label);
    if (!link || link.closest(".nav-dropdown")) return;
    const item = link.closest("li") || link.parentElement;
    if (!item) return;
    item.classList.add("nav-dropdown");
    link.classList.add("nav-dropdown-toggle");
    link.setAttribute("aria-haspopup", "true");
    link.setAttribute("aria-expanded", "false");
    item.appendChild(buildMenu(items, type));
    item.addEventListener("focusin", () => link.setAttribute("aria-expanded", "true"));
    item.addEventListener("focusout", () => link.setAttribute("aria-expanded", "false"));
    item.addEventListener("mouseenter", () => link.setAttribute("aria-expanded", "true"));
    item.addEventListener("mouseleave", () => link.setAttribute("aria-expanded", "false"));
  }

  function init() {
    enhance("products", products, "products");
    enhance("industries", industries, "industries");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

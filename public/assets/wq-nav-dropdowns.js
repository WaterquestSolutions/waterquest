(() => {
  const menus = {
    products: [
      ["All Products", "/products/"],
      ["Axial Piston Pumps", "/products/axial-piston-pumps/"],
      ["Duplex Seawater Pumps", "/products/duplex-seawater-pumps/"],
      ["Water Hydraulic HPUs", "/products/water-hydraulics-hpu/"],
      ["Water Hydraulic Cylinders", "/products/water-hydraulic-cylinders/"],
      ["Water Hydraulic Motors", "/products/water-hydraulic-motors/"],
      ["Water Hydraulic Valves", "/products/water-hydraulic-valves/"],
      ["Fire Pumps", "/products/axial-piston-fire-pumps/"],
      ["Desalination Power Centre", "/products/power-centre-reverse-osmosis/"]
    ],
    industries: [
      ["All Industries", "/industries/"],
      ["Municipal Infrastructure", "/industries/water-hydraulics-for-municipal-infrastructure/"],
      ["Marine and Coastal", "/industries/water-hydraulics-for-marine-and-coastal-applications/"],
      ["Mining Operations", "/industries/water-hydraulics-for-mining-operations/"],
      ["Food and Beverage", "/industries/water-hydraulics-for-food-and-beverage-manufacturing/"],
      ["Fire Suppression", "/industries/water-hydraulics-for-fire-suppression-systems/"],
      ["Hydroelectric Power", "/industries/water-hydraulics-for-hydroelectric-power/"],
      ["Water Parks and Aquatic Facilities", "/industries/water-hydraulics-for-water-parks-and-wave-pools/"],
      ["Dust Control", "/industries/water-hydraulics-for-dust-control-systems/"],
      ["Odour Control and Ventilation", "/industries/water-hydraulics-for-odor-control-and-ventilation-systems/"],
      ["Agriculture and Irrigation", "/industries/water-hydraulics-for-agriculture-and-irrigation-systems/"],
      ["Desalination and Reverse Osmosis", "/industries/water-hydraulics-for-desalination-and-reverse-osmosis-systems/"],
      ["Hydrogen Production", "/industries/water-hydraulic-systems-for-hydrogen-production/"],
      ["Forestry and Logging", "/industries/water-hydraulics-for-forestry-and-logging-operations/"],
      ["Wastewater Treatment", "/industries/water-hydraulic-systems-for-wastewater-treatment-plants/"],
      ["Pulp and Paper Mills", "/industries/water-hydraulic-systems-for-pulp-and-paper-mills/"]
    ]
  };

  function normaliseLabel(text) {
    return text.trim().toLowerCase().replace(/\s+/g, " ");
  }

  function activeFor(href) {
    const path = window.location.pathname;
    if (href === "/products/") return path.startsWith("/products/") || /^\/(?:p1-pump|t-p|tcheck-)/.test(path);
    if (href === "/industries/") return path.startsWith("/industries/");
    return path === href || (href !== "/" && path.startsWith(href));
  }

  function normaliseHeader() {
    let header = document.querySelector("nav#nav, nav[aria-label='Main navigation'], nav.site-nav, nav.wq-site-nav, header.site-header nav, nav.nav, nav.nav-inner, body > nav") || document.querySelector("nav");
    const legacyWrapper = header?.closest("header.site-header");
    if (legacyWrapper) {
      const replacement = document.createElement("nav");
      legacyWrapper.replaceWith(replacement);
      header = replacement;
    }
    if (!header) {
      header = document.createElement("nav");
      document.body.prepend(header);
    }
    header.id = "nav";
    header.className = "wq-site-header";
    header.setAttribute("aria-label", "Main navigation");
    const items = [
      ["Products", "/products/"],
      ["Industries", "/industries/"],
      ["Knowledge Hub", "/knowledge-hub/"],
      ["About", "/about/"],
      ["Pilot", "/pilot/"],
      ["Engineering Review", "/contact/"]
    ];
    const links = items.map(([label, href]) => {
      const active = activeFor(href) ? ' class="active"' : '';
      return '<li><a href="' + href + '"' + active + '>' + label + '</a></li>';
    }).join('');
    header.innerHTML = '<div class="wq-header-inner"><a class="wq-brand" href="/"><img class="wq-brand-mark" src="/assets/waterquest-logo-square.png" alt="" width="54" height="54"><span class="wq-brand-nameplate"><span class="wq-brand-name">WaterQuest Solutions</span><span class="wq-brand-line">Stop Leaking Oil Into the Future.</span></span></a><button class="wq-nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button><ul class="nav-links wq-nav-links">' + links + '</ul></div>';
    const toggle = header.querySelector(".wq-nav-toggle");
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("wq-menu-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  function normaliseFooter() {
    let footer = document.querySelector("footer");
    if (!footer) {
      footer = document.createElement("footer");
      document.body.appendChild(footer);
    }
    footer.className = "wq-site-footer";
    footer.setAttribute("role", "contentinfo");
    footer.innerHTML = '<div class="wq-footer-inner"><div class="wq-footer-grid"><div class="wq-footer-brand"><strong>WaterQuest Solutions</strong><span>Clean Hydraulics for Sustainable Industry</span><p>Water hydraulic components and systems for municipal, industrial and marine applications. From your first question to a defined equipment enquiry, WaterQuest provides Canadian support to help match the fluid, components and controls to the work.</p></div><div><h2>Products</h2><ul><li><a href="/products/">All Products</a></li><li><a href="/products/axial-piston-pumps/">Axial Piston Pumps</a></li><li><a href="/products/duplex-seawater-pumps/">Duplex Seawater Pumps</a></li><li><a href="/products/water-hydraulics-hpu/">Hydraulic Power Units</a></li><li><a href="/products/water-hydraulic-motors/">Motors</a></li><li><a href="/products/water-hydraulic-cylinders/">Cylinders</a></li><li><a href="/products/water-hydraulic-valves/">Valves</a></li></ul></div><div><h2>Industries</h2><ul><li><a href="/industries/">All Industries</a></li><li><a href="/industries/water-hydraulics-for-municipal-infrastructure/">Municipal Infrastructure</a></li><li><a href="/industries/water-hydraulics-for-marine-and-coastal-applications/">Marine and Coastal</a></li><li><a href="/industries/water-hydraulics-for-fire-suppression-systems/">Fire Suppression</a></li><li><a href="/industries/water-hydraulics-for-desalination-and-reverse-osmosis-systems/">Desalination</a></li></ul></div><div><h2>Company</h2><ul><li><a href="/knowledge-hub/">Knowledge Hub</a></li><li><a href="/about/">About</a></li><li><a href="/pilot/">Pilot</a></li><li><a href="/contact/">Engineering Review</a></li><li><a href="/wqs-stainless/">WQS Stainless</a></li><li><a href="mailto:bruce@waterquestsolutions.com">bruce@waterquestsolutions.com</a></li></ul></div></div><div class="wq-footer-bottom"><p>© 2026 WaterQuest Solutions. Vancouver, British Columbia, Canada.</p><p>316 SS / PEEK · Oil-Free · Canadian Support</p></div></div>';
  }

  function findNavContainers() {
    return Array.from(document.querySelectorAll(".nav-links, .wq-nav-links, .links"))
      .filter((nav) => !nav.dataset.wqDropdowns);
  }

  function getDirectLinks(nav) {
    return Array.from(nav.children)
      .map((child) => child.matches?.("a") ? child : child.querySelector?.(":scope > a"))
      .filter(Boolean);
  }

  function buildDropdown(items) {
    const menu = document.createElement("div");
    menu.className = "wq-nav-dropdown";
    menu.setAttribute("role", "menu");
    for (const [label, href] of items) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      link.setAttribute("role", "menuitem");
      menu.appendChild(link);
    }
    return menu;
  }

  function wrapLooseAnchor(anchor) {
    if (anchor.parentElement?.classList.contains("wq-nav-menu-item")) return anchor.parentElement;
    const wrapper = document.createElement("span");
    wrapper.className = "wq-nav-menu-item";
    anchor.replaceWith(wrapper);
    wrapper.appendChild(anchor);
    return wrapper;
  }

  function enhanceAnchor(anchor, key) {
    const items = menus[key];
    if (!items || anchor.dataset.wqDropdownEnhanced) return;
    const parent = anchor.parentElement?.tagName === "LI" ? anchor.parentElement : wrapLooseAnchor(anchor);
    parent.classList.add("wq-nav-menu-item");
    anchor.classList.add("wq-nav-menu-toggle");
    anchor.setAttribute("aria-haspopup", "true");
    anchor.setAttribute("aria-expanded", "false");
    parent.appendChild(buildDropdown(items));
    anchor.dataset.wqDropdownEnhanced = "true";

    anchor.addEventListener("click", (event) => {
      if (window.matchMedia("(hover: none)").matches) {
        const isOpen = parent.classList.toggle("wq-menu-open");
        anchor.setAttribute("aria-expanded", String(isOpen));
        if (isOpen) event.preventDefault();
      }
    });
  }

  function closeOnOutsideClick(event) {
    document.querySelectorAll(".wq-nav-menu-item.wq-menu-open").forEach((item) => {
      if (!item.contains(event.target)) {
        item.classList.remove("wq-menu-open");
        item.querySelector(".wq-nav-menu-toggle")?.setAttribute("aria-expanded", "false");
      }
    });
  }

  function enhanceNavs() {
    normaliseHeader();
    normaliseFooter();
    for (const nav of findNavContainers()) {
      nav.dataset.wqDropdowns = "true";
      for (const anchor of getDirectLinks(nav)) {
        const label = normaliseLabel(anchor.textContent || "");
        if (label === "products") enhanceAnchor(anchor, "products");
        if (label === "industries") enhanceAnchor(anchor, "industries");
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceNavs);
  } else {
    enhanceNavs();
  }
  document.addEventListener("click", closeOnOutsideClick);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeOnOutsideClick(event);
  });
})();

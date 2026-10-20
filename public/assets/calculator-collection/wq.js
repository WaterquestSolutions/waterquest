(function () {
  var nav = document.querySelector(".wq-global-header") || document.getElementById("wq-nav") || document.getElementById("nav");
  var toggle = document.querySelector(".wq-mobile-toggle, .wq-menu-toggle, .menu-toggle");

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("wq-menu-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var onScroll = function () {
    if (nav) {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  document.querySelectorAll("[data-faq-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      var item = button.closest("[data-faq-item]");
      if (item) item.classList.toggle("is-open");
    });
  });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-up").forEach(function (el) {
      observer.observe(el);
    });
  }
}());

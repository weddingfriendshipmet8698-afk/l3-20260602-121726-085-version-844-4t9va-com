(function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      window.clearInterval(timer);
      showSlide(dotIndex);
      startHero();
    });
  });

  startHero();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));

  searchInputs.forEach(function (input) {
    var scope = input.closest("main") || document;
    var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-card"));

    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();

      items.forEach(function (item) {
        var haystack = [
          item.getAttribute("data-title"),
          item.getAttribute("data-year"),
          item.getAttribute("data-region"),
          item.getAttribute("data-type"),
          item.getAttribute("data-genre"),
          item.textContent
        ].join(" ").toLowerCase();

        item.classList.toggle("is-hidden", value && haystack.indexOf(value) === -1);
      });
    });
  });

  function attachFilter(attribute) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-" + attribute + "]"));

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter-" + attribute);
        var group = button.parentElement;
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        if (group) {
          Array.prototype.slice.call(group.querySelectorAll("button")).forEach(function (peer) {
            peer.classList.toggle("is-active", peer === button);
          });
        }

        cards.forEach(function (card) {
          var match = !value || card.getAttribute("data-" + attribute) === value;
          card.dataset[attribute + "FilterHidden"] = match ? "0" : "1";
          var hiddenByType = card.dataset.typeFilterHidden === "1";
          var hiddenByYear = card.dataset.yearFilterHidden === "1";
          card.classList.toggle("is-hidden", hiddenByType || hiddenByYear);
        });
      });
    });
  }

  attachFilter("type");
  attachFilter("year");
})();

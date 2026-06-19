(function() {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobileNav.hidden = expanded;
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dots button"));
  let currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener("click", function() {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function() {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  const filterRoot = document.querySelector("[data-filterable='true']");
  const searchInput = document.querySelector(".movie-search");
  const yearFilter = document.querySelector(".year-filter");

  if (filterRoot && searchInput && yearFilter) {
    const cards = Array.from(filterRoot.querySelectorAll(".movie-card, .rank-card"));
    const years = Array.from(new Set(cards.map(function(card) {
      return card.dataset.year || "";
    }).filter(Boolean))).sort(function(a, b) {
      return Number(b) - Number(a);
    });

    years.forEach(function(year) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });

    function applyFilters() {
      const keyword = searchInput.value.trim().toLowerCase();
      const year = yearFilter.value;

      cards.forEach(function(card) {
        const haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.category,
          card.textContent
        ].join(" ").toLowerCase();
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesYear = !year || card.dataset.year === year;
        card.classList.toggle("is-hidden", !(matchesKeyword && matchesYear));
      });
    }

    searchInput.addEventListener("input", applyFilters);
    yearFilter.addEventListener("change", applyFilters);
  }
}());

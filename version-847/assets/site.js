(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var heroCopies = Array.prototype.slice.call(document.querySelectorAll('.hero-copy'));
    var heroDots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var heroIndex = 0;

    function activateHero(index) {
      if (!heroCopies.length) {
        return;
      }

      heroIndex = index % heroCopies.length;

      heroCopies.forEach(function (item, i) {
        item.classList.toggle('active', i === heroIndex);
      });

      heroDots.forEach(function (item, i) {
        item.classList.toggle('active', i === heroIndex);
      });
    }

    heroDots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activateHero(index);
      });
    });

    if (heroCopies.length > 1) {
      window.setInterval(function () {
        activateHero(heroIndex + 1);
      }, 5200);
    }

    var searchInput = document.querySelector('[data-filter="keyword"]');
    var regionSelect = document.querySelector('[data-filter="region"]');
    var typeSelect = document.querySelector('[data-filter="type"]');
    var yearSelect = document.querySelector('[data-filter="year"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput && searchInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }

        if (region && normalize(card.getAttribute('data-region')).indexOf(region) === -1) {
          ok = false;
        }

        if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) {
          ok = false;
        }

        if (year && normalize(card.getAttribute('data-year')) !== year) {
          ok = false;
        }

        card.classList.toggle('hidden-card', !ok);
      });
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });

  window.initPlayer = function (videoId, layerId, source) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function load() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      load();

      if (layer) {
        layer.classList.add('hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  };
})();

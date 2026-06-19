(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMissingImages() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
        img.removeAttribute('srcset');
      }, { once: true });
    });
  }

  function initMobileNav() {
    var button = qs('[data-mobile-menu-button]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (slides.length <= 1) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function initCardFilters() {
    var input = qs('[data-page-filter]');
    var yearSelect = qs('[data-year-filter]');
    var typeSelect = qs('[data-type-filter]');
    var cards = qsa('[data-movie-card]');
    var empty = qs('[data-empty-state]');
    if (!cards.length || (!input && !yearSelect && !typeSelect)) {
      return;
    }
    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }
    function apply() {
      var keyword = normalize(input && input.value);
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var hay = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region'));
        var okKeyword = !keyword || hay.indexOf(keyword) !== -1;
        var okYear = !year || card.getAttribute('data-year') === year;
        var okType = !type || card.getAttribute('data-type') === type;
        var ok = okKeyword && okYear && okType;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    [input, yearSelect, typeSelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  }

  function initSearchPage() {
    var root = qs('[data-global-search]');
    if (!root || !window.MOVIES) {
      return;
    }
    var input = qs('[data-global-search-input]', root);
    var results = qs('[data-global-search-results]', root);
    var prefix = root.getAttribute('data-prefix') || '';
    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }
    function render(items) {
      results.innerHTML = items.slice(0, 80).map(function (movie) {
        var image = prefix + movie.image + '.jpg';
        return '' +
          '<a class="search-result" href="' + prefix + 'movie/' + movie.id + '.html">' +
          '  <span class="rank-thumb"><img src="' + image + '" alt="' + movie.title + '" loading="lazy"></span>' +
          '  <span>' +
          '    <strong>' + movie.title + '</strong><br>' +
          '    <span class="card-text">' + movie.year + ' · ' + movie.region + ' · ' + movie.genre + '</span>' +
          '  </span>' +
          '</a>';
      }).join('');
      initMissingImages();
    }
    function apply() {
      var keyword = normalize(input.value);
      if (!keyword) {
        render(window.MOVIES.slice(0, 40));
        return;
      }
      var filtered = window.MOVIES.filter(function (movie) {
        var hay = normalize(movie.title + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.year);
        return hay.indexOf(keyword) !== -1;
      });
      render(filtered);
    }
    input.addEventListener('input', apply);
    apply();
  }

  function initPlayers() {
    qsa('[data-video-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play-button]', player);
      var overlay = qs('[data-video-overlay]', player);
      var status = qs('[data-player-status]', player);
      var source = player.getAttribute('data-hls');
      var hlsInstance = null;
      if (!video || !button || !source) {
        return;
      }
      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }
      function attachSource() {
        if (video.getAttribute('data-source-attached') === '1') {
          return Promise.resolve();
        }
        video.setAttribute('data-source-attached', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          return new Promise(function (resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus('播放源加载失败，请检查网络或稍后重试。');
              }
            });
          });
        }
        setStatus('当前浏览器不支持 HLS 播放。');
        return Promise.reject(new Error('HLS not supported'));
      }
      function start() {
        setStatus('正在加载播放源...');
        attachSource().then(function () {
          return video.play();
        }).then(function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
          setStatus('正在播放，可使用播放器控件暂停、拖动或全屏。');
        }).catch(function () {
          setStatus('播放未能启动，请再次点击播放按钮或检查浏览器权限。');
        });
      }
      button.addEventListener('click', start);
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && !video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMissingImages();
    initMobileNav();
    initHero();
    initCardFilters();
    initSearchPage();
    initPlayers();
  });
}());

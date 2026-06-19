function initVideoPlayer(source) {
  var video = document.getElementById("movie-player");
  var cover = document.querySelector(".player-cover");
  var loaded = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function loadVideo() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    loadVideo();
    video.controls = true;

    if (cover) {
      cover.classList.add("is-hidden");
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      playVideo();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

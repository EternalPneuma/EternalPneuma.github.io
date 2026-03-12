/**
 * Snow Effect for Hexo NexT Blog
 *
 * Ported from Gemini Voyager (snowEffect/index.ts).
 * Renders a fullscreen canvas snow animation on page load.
 * Uses `pointer-events: none` so it never blocks page interactions.
 * Pauses when the tab is hidden to save CPU.
 *
 * Graceful transitions: when disabling, existing snowflakes continue
 * falling naturally. New snowflakes stop spawning, and the canvas is
 * cleaned up once all particles have left the viewport.
 *
 * Performance notes:
 * - Single canvas with simple arc draws (no images, no shadows)
 * - Snowflakes sorted by opacity at init; drawn in batches to minimise fillStyle switches
 * - Animation pauses on hidden tabs via visibilitychange
 * - ~240 particles total — negligible GPU/CPU overhead
 */

(function () {
  var CANVAS_ID = 'blog-snow-canvas';

  /**
   * Three layers simulate depth-of-field:
   *   dust  – tiny background particles, slow, faint
   *   mid   – main visible snowflakes
   *   large – sparse foreground flakes, faster, more opaque
   */
  var LAYERS = [
    // dust
    { count: 100, radius: [0.15, 0.45], speed: [0.15, 0.4],  opacity: [0.15, 0.35], drift: [0.05, 0.2]  },
    // mid
    { count: 80,  radius: [0.5,  1.0],  speed: [0.4,  1.0],  opacity: [0.3,  0.6],  drift: [0.15, 0.45] },
    // large
    { count: 60,  radius: [1.2,  2.5],  speed: [0.8,  1.6],  opacity: [0.5,  0.8],  drift: [0.25, 0.6]  },
  ];

  /** Effect lifecycle: off → active ⇄ draining → off */
  var state = 'off';
  var canvas = null;
  var ctx = null;
  var animationFrameId = null;
  var snowflakes = [];
  var resizeHandler = null;
  var visibilityHandler = null;

  /** Random float in [min, max) */
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function createSnowflake(canvasWidth, canvasHeight, layer, randomY) {
    return {
      x:         Math.random() * canvasWidth,
      y:         randomY ? Math.random() * canvasHeight : -(Math.random() * canvasHeight),
      radius:    rand(layer.radius[0], layer.radius[1]),
      opacity:   rand(layer.opacity[0], layer.opacity[1]),
      speedY:    rand(layer.speed[0],   layer.speed[1]),
      drift:     rand(layer.drift[0],   layer.drift[1]),
      driftFreq: rand(0.0003, 0.0012),
      phase:     Math.random() * Math.PI * 2,
    };
  }

  function initSnowflakes(width, height) {
    var flakes = [];
    for (var li = 0; li < LAYERS.length; li++) {
      var layer = LAYERS[li];
      for (var i = 0; i < layer.count; i++) {
        flakes.push(createSnowflake(width, height, layer, true));
      }
    }
    // Sort by opacity so we can batch fillStyle changes during draw
    flakes.sort(function (a, b) { return a.opacity - b.opacity; });
    snowflakes = flakes;
  }

  function updateAndDraw(time) {
    if (!ctx || !canvas) return;

    var width  = canvas.width;
    var height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    var currentOpacity = -1;
    var visibleCount = 0;

    for (var i = 0; i < snowflakes.length; i++) {
      var flake = snowflakes[i];
      flake.y += flake.speedY;
      flake.x += Math.sin(flake.phase + time * flake.driftFreq) * flake.drift;

      // Recycle when off-screen bottom (or skip during drain)
      if (flake.y > height + flake.radius) {
        if (state === 'draining') {
          continue;
        }
        flake.y = -flake.radius;
        flake.x = Math.random() * width;
      }

      visibleCount++;

      // Wrap horizontal
      if (flake.x > width + flake.radius) {
        flake.x = -flake.radius;
      } else if (flake.x < -flake.radius) {
        flake.x = width + flake.radius;
      }

      // Batch fillStyle: only update when opacity changes (quantised to 2 decimals)
      var quantised = Math.round(flake.opacity * 50) / 50;
      if (quantised !== currentOpacity) {
        currentOpacity = quantised;
        ctx.fillStyle = 'rgba(255,255,255,' + currentOpacity + ')';
      }

      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // All particles have left the viewport — finish draining
    if (state === 'draining' && visibleCount === 0) {
      finalizeDrain();
      return;
    }

    animationFrameId = requestAnimationFrame(updateAndDraw);
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function startAnimation() {
    if (animationFrameId !== null) return;
    animationFrameId = requestAnimationFrame(updateAndDraw);
  }

  function stopAnimation() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      startAnimation();
    } else {
      stopAnimation();
    }
  }

  function enable() {
    if (state === 'active') return;
    if (state === 'draining') {
      // Cancel drain — resume normal particle recycling
      state = 'active';
      return;
    }
    state = 'active';

    canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483647;';
    document.documentElement.appendChild(canvas);

    ctx = canvas.getContext('2d');
    if (!ctx) {
      forceDisable();
      return;
    }

    resizeCanvas();
    initSnowflakes(canvas.width, canvas.height);
    startAnimation();

    resizeHandler = resizeCanvas;
    window.addEventListener('resize', resizeHandler);

    visibilityHandler = handleVisibilityChange;
    document.addEventListener('visibilitychange', visibilityHandler);
  }

  /**
   * Graceful disable: stop spawning new snowflakes and let existing ones
   * fall off the bottom of the viewport naturally.
   */
  function disable() {
    if (state !== 'active') return;
    state = 'draining';
  }

  /** Complete the drain: remove canvas and clean up all resources. */
  function finalizeDrain() {
    state = 'off';
    stopAnimation();

    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }

    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = null;
    }

    if (canvas) {
      canvas.remove();
      canvas = null;
    }

    ctx = null;
    snowflakes = [];
  }

  /** Immediate disable: remove everything without draining (e.g. page unload). */
  function forceDisable() {
    if (state === 'off') return;
    finalizeDrain();
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enable);
  } else {
    enable();
  }

  // Immediate cleanup on page unload (no need to drain)
  window.addEventListener('beforeunload', forceDisable);
})();

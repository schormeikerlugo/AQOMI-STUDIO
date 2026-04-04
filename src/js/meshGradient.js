/**
 * WebGL Mesh Gradient Shader
 * Applies to canvases: mesh-canvas, svc-mesh-canvas, ind-mesh-canvas, stu-mesh-canvas
 * Now with lifecycle: only runs on the active page's canvas
 */
import { onPageActivate } from './router.js';

const VERTEX_SHADER = `
  precision mediump float;
  attribute vec2 a_position;
  varying vec2 vUv;
  void main() {
    vUv = .5 * (a_position + 1.);
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

function createFragmentShader(colorConfig) {
  return `
    precision mediump float;
    varying vec2 vUv;
    uniform float u_time;
    uniform float u_ratio;
    uniform vec2  u_pointer_position;
    uniform float u_scroll_progress;

    vec2 rotate(vec2 uv, float th) {
      return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
    }

    float neuro_shape(vec2 uv, float t, float p) {
      vec2 sine_acc = vec2(0.);
      vec2 res      = vec2(0.);
      float scale   = 8.;
      for (int j = 0; j < 15; j++) {
        uv        = rotate(uv, 1.);
        sine_acc = rotate(sine_acc, 1.);
        vec2 layer = uv * scale + float(j) + sine_acc - t;
        sine_acc  += sin(layer) + 2.4 * p;
        res       += (.5 + .5 * cos(layer)) / scale;
        scale     *= 1.2;
      }
      return res.x + res.y;
    }

    void main() {
      vec2 uv = .5 * vUv;
      uv.x *= u_ratio;

      vec2 pointer = vUv - u_pointer_position;
      pointer.x   *= u_ratio;
      float p = clamp(length(pointer), 0., 1.);
      p = .25 * pow(1. - p, 2.);

      float t     = u_time;

      float noise = neuro_shape(uv, t, p);
      noise = 1.2 * pow(noise, 3.);
      noise += pow(noise, 10.);
      noise = max(.0, noise - .5);
      noise *= (1. - length(vUv - .5));

      vec3 color = vec3(${colorConfig.base});
      color = mix(color, vec3(${colorConfig.mix}),
                  0.32 + 0.16 * sin(2.0 * u_scroll_progress + 1.2));
      color += vec3(${colorConfig.accent}) * 0.15
               * sin(2.0 * u_scroll_progress + 1.5);

      vec3 finalColor;
      if (${colorConfig.inverted ? 'true' : 'false'}) {
        finalColor = clamp(noise * color * 2.8, 0.0, 1.0);
      } else {
        finalColor = max(vec3(1.0) - noise * color, vec3(0.45));
      }
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;
}

// Each active shader instance — { canvasId, rafId, running, start() stop() }
const instances = [];

function initShader(canvasId, colorConfig) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return null;

  const ptr = { x: 0.5, y: 0.5, tX: 0.5, tY: 0.5 };

  function resize() {
    const parent = canvas.parentElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = parent.offsetWidth * dpr;
    canvas.height = parent.offsetHeight * dpr;
    canvas.style.width = parent.offsetWidth + 'px';
    canvas.style.height = parent.offsetHeight + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compile(gl.FRAGMENT_SHADER, createFragmentShader(colorConfig));
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRatio = gl.getUniformLocation(prog, 'u_ratio');
  const uPointer = gl.getUniformLocation(prog, 'u_pointer_position');
  const uScroll = gl.getUniformLocation(prog, 'u_scroll_progress');

  resize();
  window.addEventListener('resize', resize);
  gl.uniform1f(uRatio, canvas.width / canvas.height);

  document.addEventListener('mousemove', (e) => {
    ptr.tX = e.clientX / window.innerWidth;
    ptr.tY = 1.0 - e.clientY / window.innerHeight;
  });

  const startTime = performance.now();
  let rafId = null;
  let running = false;

  function render() {
    if (!running) return;
    ptr.x += (ptr.tX - ptr.x) * 0.06;
    ptr.y += (ptr.tY - ptr.y) * 0.06;

    gl.uniform1f(uTime, (performance.now() - startTime) * 0.00028);
    gl.uniform1f(uRatio, canvas.width / canvas.height);
    gl.uniform2f(uPointer, ptr.x, ptr.y);
    gl.uniform1f(uScroll, window.scrollY / (document.body.scrollHeight - window.innerHeight));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    rafId = requestAnimationFrame(render);
  }

  canvas.style.transition = 'opacity 2s ease';
  canvas.style.opacity = '1';

  const instance = {
    canvasId,
    start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(render);
    },
    stop() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    },
  };

  instances.push(instance);
  return instance;
}

// Map canvas IDs to the page that owns them
const CANVAS_PAGE_MAP = {
  'mesh-canvas': 'home',
  'work-mesh-canvas': 'work',
  'svc-mesh-canvas': 'services',
  'ind-mesh-canvas': 'industries',
  'stu-mesh-canvas': 'studio',
};

export function initMeshGradients() {
  const lightConfig = {
    base: '0.92, 0.92, 0.92',
    mix: '0.85, 0.85, 0.88',
    accent: '0.78, 0.78, 0.82',
  };

  const darkConfig = {
    base: '0.08, 0.08, 0.08',
    mix: '0.25, 0.25, 0.25',
    accent: '0.15, 0.15, 0.15',
  };

  const whiteOnBlackConfig = {
    base: '1.0, 1.0, 1.0',
    mix: '0.95, 0.95, 0.95',
    accent: '0.90, 0.90, 0.90',
    inverted: true,
  };

  // Pending configs for lazy-loaded canvases
  const pendingConfigs = {};

  initShader('mesh-canvas', lightConfig);
  initShader('svc-mesh-canvas', darkConfig);
  initShader('ind-mesh-canvas', darkConfig);
  initShader('stu-mesh-canvas', darkConfig);

  // work-mesh-canvas may not exist yet (lazy loaded)
  if (!initShader('work-mesh-canvas', whiteOnBlackConfig)) {
    pendingConfigs['work-mesh-canvas'] = whiteOnBlackConfig;
  }

  // Start only the home canvas initially
  instances.forEach((inst) => {
    if (CANVAS_PAGE_MAP[inst.canvasId] === 'home') inst.start();
  });

  // On page change: try pending inits, stop all, start relevant
  onPageActivate((pageId) => {
    // Try to init any pending canvases
    for (const [cid, cfg] of Object.entries(pendingConfigs)) {
      if (CANVAS_PAGE_MAP[cid] === pageId) {
        if (initShader(cid, cfg)) delete pendingConfigs[cid];
      }
    }

    instances.forEach((inst) => {
      if (CANVAS_PAGE_MAP[inst.canvasId] === pageId) {
        inst.start();
      } else {
        inst.stop();
      }
    });
  });

  // Pause all when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      instances.forEach((inst) => inst.stop());
    } else {
      // Restart only the active page's canvas
      const activePage = document.querySelector('.page.active');
      if (activePage) {
        const pageId = activePage.id.replace('page-', '');
        instances.forEach((inst) => {
          if (CANVAS_PAGE_MAP[inst.canvasId] === pageId) inst.start();
        });
      }
    }
  });
}

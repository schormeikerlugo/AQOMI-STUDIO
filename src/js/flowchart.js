/**
 * Animated process flowchart — intersection-triggered
 * Interval is cleaned up on page change
 */
import { registerCleanup, onPageActivate } from './router.js';

let flowchartIntervalId = null;

let flowchartReady = false;

function setupFlowchart() {
  const wrap = document.getElementById('fc-wrap');
  if (!wrap || flowchartReady) return;
  flowchartReady = true;

  let fired = false;

  function animate() {
    if (fired) return;
    fired = true;

    const steps = [
      { el: 'fcn1',       t: 0,    type: 'node'    },
      { el: 'fc-c1',      t: 250,  type: 'conn'    },
      { el: 'fcn2',       t: 450,  type: 'node'    },
      { el: 'fc-c2',      t: 700,  type: 'conn'    },
      { el: 'fc-dia',     t: 900,  type: 'dia'     },
      { el: 'fc-c3',      t: 1200, type: 'conn'    },
      { el: 'fc-yes-lbl', t: 1250, type: 'label'   },
      { el: 'fcn3',       t: 1300, type: 'node'    },
      { el: 'fc-c4',      t: 1600, type: 'conn'    },
      { el: 'fcn4',       t: 1850, type: 'node'    },
      { el: 'fc-c5',      t: 2150, type: 'conn'    },
      { el: 'fcn5',       t: 2350, type: 'node'    },
      { el: 'fc-c6',      t: 2650, type: 'conn'    },
      { el: 'fcn6',       t: 2850, type: 'node'    },
      { el: 'fc-c7',      t: 3100, type: 'conn'    },
      { el: 'fc-no-lbl',  t: 3200, type: 'label'   },
      { el: 'fc-iter',    t: 3300, type: 'node'    },
      { el: 'fc-c8',      t: 3550, type: 'conn'    },
      { el: 'fc-back-lbl',t: 3750, type: 'label'   },
      { el: 'fc-call',    t: 3900, type: 'callout' },
      { el: 'fc-c9',      t: 4200, type: 'conn'    },
    ];

    steps.forEach((s) => {
      setTimeout(() => {
        const el = document.getElementById(s.el);
        if (!el) return;

        if (s.type === 'node' || s.type === 'callout') {
          el.classList.add('in');
          el.classList.add('fc-active');
        } else if (s.type === 'dia') {
          el.classList.add('in');
        } else if (s.type === 'conn') {
          el.classList.add('drawn');
        } else if (s.type === 'label') {
          el.style.fill =
            s.el === 'fc-yes-lbl'  ? '#000' :
            s.el === 'fc-no-lbl'   ? 'rgba(0,0,0,0.45)' :
                                     'rgba(0,0,0,0.25)';
        }
      }, s.t);
    });

    // Looping active node highlight — starts after flowchart finishes
    setTimeout(() => {
      const nodeIds = ['fcn1', 'fcn2', 'fcn3', 'fcn4', 'fcn5', 'fcn6'];
      let idx = 0;
      flowchartIntervalId = setInterval(() => {
        nodeIds.forEach((id) => {
          const n = document.getElementById(id);
          if (n) n.classList.remove('fc-active');
        });
        const n = document.getElementById(nodeIds[idx]);
        if (n) n.classList.add('fc-active');
        idx = (idx + 1) % nodeIds.length;
      }, 3000);
    }, 2200);
  }

  const obs = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        animate();
        obs.disconnect();
      }
    },
    { threshold: 0.15 }
  );

  obs.observe(wrap);
}

export function initFlowchart() {
  // Try immediately
  setupFlowchart();

  // Also try when process page activates (lazy loaded)
  onPageActivate((pageId) => {
    if (pageId === 'why') setTimeout(setupFlowchart, 50);
  });

  // Clean up interval when leaving the process page
  registerCleanup(() => {
    if (flowchartIntervalId) {
      clearInterval(flowchartIntervalId);
      flowchartIntervalId = null;
    }
  });
}

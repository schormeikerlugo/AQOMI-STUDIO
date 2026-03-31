/**
 * Animated process flowchart — intersection-triggered
 */
export function initFlowchart() {
  const wrap = document.getElementById('fc-wrap');
  if (!wrap) return;

  let fired = false;

  function animate() {
    if (fired) return;
    fired = true;

    const steps = [
      { el: 'fcn1',       t: 0,    type: 'node'    },
      { el: 'fc-c1',      t: 500,  type: 'conn'    },
      { el: 'fcn2',       t: 900,  type: 'node'    },
      { el: 'fc-c2',      t: 1400, type: 'conn'    },
      { el: 'fc-dia',     t: 1800, type: 'dia'     },
      { el: 'fc-c3',      t: 2400, type: 'conn'    },
      { el: 'fc-yes-lbl', t: 2500, type: 'label'   },
      { el: 'fcn3',       t: 2600, type: 'node'    },
      { el: 'fc-c4',      t: 3200, type: 'conn'    },
      { el: 'fcn4',       t: 3700, type: 'node'    },
      { el: 'fc-c5',      t: 4300, type: 'conn'    },
      { el: 'fcn5',       t: 4700, type: 'node'    },
      { el: 'fc-c6',      t: 5300, type: 'conn'    },
      { el: 'fcn6',       t: 5700, type: 'node'    },
      { el: 'fc-c7',      t: 6200, type: 'conn'    },
      { el: 'fc-no-lbl',  t: 6400, type: 'label'   },
      { el: 'fc-iter',    t: 6600, type: 'node'    },
      { el: 'fc-c8',      t: 7100, type: 'conn'    },
      { el: 'fc-back-lbl',t: 7500, type: 'label'   },
      { el: 'fc-call',    t: 7800, type: 'callout' },
      { el: 'fc-c9',      t: 8400, type: 'conn'    },
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

    // Looping active node highlight
    setTimeout(() => {
      const nodeIds = ['fcn1', 'fcn2', 'fcn3', 'fcn4', 'fcn5', 'fcn6'];
      let idx = 0;
      setInterval(() => {
        nodeIds.forEach((id) => {
          const n = document.getElementById(id);
          if (n) n.classList.remove('fc-active');
        });
        const n = document.getElementById(nodeIds[idx]);
        if (n) n.classList.add('fc-active');
        idx = (idx + 1) % nodeIds.length;
      }, 3000);
    }, 4000);
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

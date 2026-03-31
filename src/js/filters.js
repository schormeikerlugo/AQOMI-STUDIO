/**
 * Portfolio work filter by category
 */
export function initFilters() {
  // Expose setFilter globally for inline onclick handlers
  window.setFilter = function (btn, cat) {
    document.querySelectorAll('.f-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.wfi').forEach((el) => {
      const match = cat === 'all' || el.dataset.cat.includes(cat);
      el.style.transition = 'opacity .3s';

      if (match) {
        el.style.display = 'block';
        setTimeout(() => (el.style.opacity = '1'), 10);
      } else {
        el.style.opacity = '0';
        setTimeout(() => (el.style.display = 'none'), 300);
      }
    });
  };
}

/**
 * Form submission handler
 */
export function initFormSubmit() {
  window.submitForm = function () {
    const b = document.querySelector('.form-submit');
    if (!b) return;
    b.style.background = '#1a5c34';
    b.style.letterSpacing = '.28em';
    b.textContent = '\u2713 Submitted \u2014 response within 48 hours';
  };
}

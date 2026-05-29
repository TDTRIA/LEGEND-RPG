// LEGEND: Roads of Ashmere v0.9.x - Ashmere Hero Panel Animations and Visual Flair
(() => {
  const root = () => document.getElementById('root');

  // Apply slight floating animation to hero key art
  function animateHeroPanel(){
    const heroImg = document.querySelector('.realm-keyart img');
    if(!heroImg) return;
    heroImg.style.transition = 'transform 4s ease-in-out';
    let up = true;
    setInterval(() => {
      heroImg.style.transform = up ? 'translateY(-6px)' : 'translateY(0px)';
      up = !up;
    }, 4000);
  }

  // Add subtle hover glow to primary buttons
  function enhanceButtons(){
    const buttons = document.querySelectorAll('.game-menu-btn.primary');
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', () => btn.style.boxShadow = '0 0 0 4px rgba(255,211,105,.2), 0 22px 42px rgba(0,0,0,.36)');
      btn.addEventListener('mouseleave', () => btn.style.boxShadow = '0 0 0 3px rgba(255,211,105,.18), 0 20px 38px rgba(0,0,0,.32)');
    });
  }

  // Ember and fog movement already handled in CSS

  function initVisualFlair(){
    animateHeroPanel();
    enhanceButtons();
  }

  // Hook after DOM ready
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initVisualFlair);
  else initVisualFlair();
})();

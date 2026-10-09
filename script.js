// Public enquiries for Genesis by Atexar.
const CONTACT_EMAIL = 'Vedanshdubey@atexar.in';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('.motion-toggle');
let motionPaused = reducedMotion.matches;
function updateMotionButton() {
  document.documentElement.classList.toggle('motion-paused', motionPaused);
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.innerHTML = motionPaused ? 'Resume motion <span aria-hidden="true">▷</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
}
updateMotionButton();
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; updateMotionButton(); });
reducedMotion.addEventListener('change', event => { motionPaused = event.matches; updateMotionButton(); });

const emailButton = document.querySelector('#email-link');
const addressLink = document.querySelector('#contact-address');
if (CONTACT_EMAIL) {
  addressLink.href = `mailto:${CONTACT_EMAIL}`;
  addressLink.textContent = CONTACT_EMAIL;
} else {
  addressLink.remove();
}

emailButton.addEventListener('click', () => {
  if (!CONTACT_EMAIL) {
    document.querySelector('.contact-feedback').textContent = 'Project enquiries are opening soon. Please check back.';
    return;
  }
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Let’s talk Genesis — Atexar')}`;
});

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); entry.target.classList.remove('pending'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => { el.classList.add('pending'); observer.observe(el); });
}

// The rotating sculpture reacts to the pointer and rests while offscreen.
const canvas = document.querySelector('#sculpture');
const stage = document.querySelector('.hero-art');
const context = canvas.getContext('2d');
if (context && window.AtexarSculpture) {
  const mesh = AtexarSculpture.makeMesh(window.innerWidth < 650 ? 90 : 140, 24);
  let width=0, height=0, inView=true, angle=0, pointerX=0, pointerY=0, easeX=0, easeY=0, lastTime=0;
  function resize() {
    const rect = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.round(rect.width*dpr); height = Math.round(rect.height*dpr);
    canvas.width=width; canvas.height=height;
    AtexarSculpture.render(context,mesh,width,height,angle+easeX*.2,easeY);
  }
  resize();
  document.documentElement.classList.add('sculpture-ready');
  new ResizeObserver(resize).observe(stage);
  document.querySelector('.hero').addEventListener('pointermove', event => {
    const rect=stage.getBoundingClientRect();
    pointerX=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
    pointerY=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
  });
  document.querySelector('.hero').addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
  if('IntersectionObserver' in window) new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;}).observe(stage);
  function frame(time) {
    requestAnimationFrame(frame);
    if (motionPaused || !inView || document.hidden) { lastTime=time; return; }
    if (time-lastTime < 1000/30) return;
    const dt=Math.min(time-lastTime,50);lastTime=time;
    angle+=dt*.000085;easeX+=(pointerX-easeX)*.045;easeY+=(pointerY-easeY)*.045;
    AtexarSculpture.render(context,mesh,width,height,angle+easeX*.2,easeY);
  }
  requestAnimationFrame(frame);
}

// A lightweight reading indicator; scroll updates are grouped into one frame.
const progressBar = document.querySelector('.reading-progress');
let scrollFrame = false;
function paintProgress() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${available > 0 ? Math.min(1, window.scrollY / available) : 0})`;
  scrollFrame = false;
}
window.addEventListener('scroll', () => {
  if (!scrollFrame) { scrollFrame = true; requestAnimationFrame(paintProgress); }
}, { passive: true });
window.addEventListener('resize', paintProgress);
paintProgress();

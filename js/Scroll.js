export const Scroll = () => {
  const d        = document,
        w        = window;
  const nav      = d.querySelector('nav');
  const navlinks = d.querySelectorAll('nav ul li a');
  
  const sections = d.querySelectorAll('section');
  // document.querySelector(`nav li a[href="#${tag}"]`).parentElement.classList.add(
  
  const minScroll = 0;
  const maxScroll = d.body.scrollHeight - w.innerHeight;
  
  const scroll = () => {
    console.log('scroll');
    const scrollY = w.scrollY;
    
    if (scrollY >= minScroll && scrollY <= maxScroll) {
      nav.classList.add('fixed');
    } else {
      nav.classList.remove('fixed');
    }
    
    for (let i = 0; i < navlinks.length; i++) {
      const section = sections[i];
      const top     = section.offsetTop;
      const height  = section.offsetHeight;
      
      if (scrollY >= top && scrollY < top + height) {
        navlinks[i].classList.add('active');
      } else {
        navlinks[i].classList.remove('active');
      }
    }
  }
  
  w.addEventListener('onScroll', scroll);
}

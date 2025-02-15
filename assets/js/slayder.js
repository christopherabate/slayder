// Hash
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      location.hash = `#${entry.target.id}`;
      document.title = `${document.querySelector("h1").innerText} - ${entry.target.querySelector('h1')?.innerText || entry.target.id}`;
      entry.target.focus();
    }
  });
}, { threshold: 1 });
document.querySelectorAll("section").forEach(section => observer.observe(section));

// Summary
document.querySelector("#summary ul").innerHTML = [...document.querySelectorAll('section h2')].map(heading => `
  <li><a class="dropdown-item" href="#${heading.closest('section').id}">${heading.textContent}</a></li>
`).join('');

// Pagination
["load", "hashchange"].forEach(event => {
  window.addEventListener(event, () => {
    const slides = [...document.querySelectorAll("section")].map(slide => slide.id);
    const currentIndex = slides.indexOf(window.location.hash.split("#").pop());

    document.querySelector("#pagination ul").innerHTML = `
      <li class="page-item ${currentIndex === 0 ? 'disabled' : ''}">
        <a ${currentIndex > 0 ? `href="#${slides[currentIndex - 1]}"` : ''} class="page-link" aria-label="Previous"></a>
      </li>
      ${slides.map((slide, index) => `
        <li class="page-item ${currentIndex === index ? 'active' : ''}" ${currentIndex === index ? 'aria-current="page"' : ''}>
          <a href="#${slide}" class="page-link">${index + 1}</a>
        </li>
      `).join('')}
      <li class="page-item ${currentIndex === slides.length - 1 ? 'disabled' : ''}">
        <a ${currentIndex < slides.length - 1 ? `href="#${slides[currentIndex + 1]}"` : ''} class="page-link" aria-label="Next"></a>
      </li>
    `;
  });
});

// Fullscreen
document.querySelector("#fullscreen").addEventListener("click", (event) => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
    return;
  }
  document.body.requestFullscreen();
});

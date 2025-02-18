(() => {
  'use strict'
  
  // Interface lang
  function i18n(key) {
    const translations = {
      en: {
        training: "Training",
        previous: "Previous",
        next: "Next"
      },
      fr: {
        training: "Formation",
        previous: "Précédente",
        next: "Suivante"
      }
    };
    return translations[document.documentElement.lang || 'en'][key] || key;
  }

  // Observe section change
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let main_title = document.querySelector('#cover h1');
        let section_title = entry.target.querySelector('h1') ? null : (function() {
          for (let section = entry.target.previousElementSibling; section; section = section.previousElementSibling) {
            if (section.querySelector('h1')) return section.querySelector('h1');
          }
        })();
        
        // Change URL
        if (location.hash !== `#${entry.target.id}`) history.replaceState(null, "", `#${entry.target.id}`);
        
        // Change H1
        document.querySelector('h1').innerText = entry.target.id === "cover" ? i18n('training') : (section_title ? section_title.innerText : main_title.innerText);
        
        // Change title
        document.title = `${section_title ? `${main_title.innerText} - ${section_title.innerText}` : (entry.target.id === "cover") ? i18n('training') : main_title.innerText} - ${entry.target.querySelector('h1, h2, h3, h4, h5, h6')?.innerText || entry.target.id}`;

        // Summary buils
        document.querySelector('#summary .dropdown-menu').innerHTML = [...document.querySelectorAll('section h1')].map(heading => `
          <li ${heading === (section_title || entry.target.querySelector('h1')) ? 'class="active"' : ''}><a class="dropdown-item d-flex align-items-center" href="#${heading.closest('section').id}">${heading.textContent}<svg class="ms-auto d-none" width="1em" height="1em" fill="currentColor"><use href="#check"></use></svg></a></li>
        `).join('');

        // Pagination buid
        const slides = [...document.querySelectorAll('section')].map(slide => slide.id);
        const currentIndex = slides.indexOf(entry.target.id);
        document.querySelector('#pagination .pagination').innerHTML = `
          <li class="page-item ${currentIndex === 0 ? 'disabled' : ''}">
            <a ${currentIndex > 0 ? `href="#${slides[currentIndex - 1]}"` : ''} class="page-link" aria-label="${i18n('previous')}"></a>
          </li>
          ${slides.map((slide, index) => `
            <li class="page-item ${currentIndex === index ? 'active' : ''}" ${currentIndex === index ? 'aria-current="page"' : ''}>
              <a href="#${slide}" class="page-link">${index + 1}</a>
            </li>
          `).join('')}
          <li class="page-item ${currentIndex === slides.length - 1 ? 'disabled' : ''}">
            <a ${currentIndex < slides.length - 1 ? `href="#${slides[currentIndex + 1]}"` : ''} class="page-link" aria-label="${i18n('next')}"></a>
          </li>
        `;
      }
    });
  }, { threshold: .5 });
  document.querySelectorAll('section').forEach(section => observer.observe(section));

  // Fullscreen enable
  document.querySelector('#fullscreen').addEventListener('click', (event) => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    document.body.requestFullscreen();
  });

  // Popovers init
  const popoverList = [...document.querySelectorAll('[data-bs-toggle="popover"]')].map(popoverTriggerEl => new boosted.Popover(popoverTriggerEl));

  // Quiz validation
  document.querySelectorAll('.quiz').forEach(form => {
    form.addEventListener('submit', event => {
      const validateInput = () => {
        form.querySelectorAll('input').forEach(input => {
          input.classList.toggle('valid', input.checked === !!input.parentElement.querySelector(".badge"));
          input.classList.toggle('invalid', input.checked !== !!input.parentElement.querySelector(".badge"));
        });
      };

      validateInput();
      form.addEventListener('change', () => validateInput());
      event.preventDefault();
      event.stopPropagation();
      form.classList.add('validated');
      form.querySelector("button[type='submit']").disabled = true;
    }, false);
  });

  // Highlight code
  hljs.highlightAll();
})()
(() => {
  'use strict'

  fetch("assets/trainings/rediger-accessible_fr.md")
    .then(response => response.text())
    .then(markdown => {

      // Custom renders for MARKED
      const renderer = {
        heading({ tokens, depth }) {
          return `<h${depth} ${depth === 1 || depth === 2 ? `class="display-${depth}"` : ''}>${this.parser.parseInline(tokens)}</h${depth}>`;
        },
        strong({ tokens }) {
          return `<strong class="text-primary">${this.parser.parseInline(tokens)}</strong>`;
        }
      };

      //Custom section for MARKED
      const section = {
        name: 'section',
        level: 'block',
        start(src) {
          return src.match(/^::: /);
        },
        tokenizer(src) {
          const rule = /^::: (\S+)\s?(\S*?)\n([\s\S]*?)(?=:::|$)/;
          const match = rule.exec(src);

          if (match) {
            return {
              type: 'section',
              raw: match[0],
              id: match[1],
              special: match[2],
              content: match[3].trim()
            };
          }
        },
        renderer(token) {
          return `<section id="${token.id}" ${token.special ? 'class="d-flex align-items-center"' : ''}><div>${marked.parse(token.content)}</div></section>`;
        }
      };

      // MARKED init
      marked.use({ breaks: true, renderer, extensions: [section] });
      document.querySelector('main').innerHTML = marked.parse(markdown);

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
            let section_title = entry.target.querySelector('h1') ? null : (function () {
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
              <li ${heading === (section_title || entry.target.querySelector('h1')) ? 'class="active"' : ''}><a class="dropdown-item d-flex align-items-center" href="#${heading.closest('section').id}">${heading.textContent}<svg class="ms-auto d-none" width="1em" height="1em"><use xlink:href="assets/images/slayder-sprites.svg#check"></use></svg></a></li>
            `).join('');

            // Pagination buid
            const slides = [...document.querySelectorAll('section')].map(slide => slide.id);
            const currentIndex = slides.indexOf(entry.target.id);
            document.querySelector('#pagination .pagination').innerHTML = `
              <li class="page-item ${currentIndex === 0 ? 'disabled' : ''}">
                <a ${currentIndex > 0 ? `href="#${slides[currentIndex - 1]}"` : ''} class="page-link">${i18n('previous')}</a>
              </li>
              ${slides.map((slide, index) => `
                <li class="page-item ${currentIndex === index ? 'active' : ''}" ${currentIndex === index ? 'aria-current="page"' : ''}>
                  <a href="#${slide}" class="page-link">${index + 1}</a>
                </li>
              `).join('')}
              <li class="page-item ${currentIndex === slides.length - 1 ? 'disabled' : ''}">
                <a ${currentIndex < slides.length - 1 ? `href="#${slides[currentIndex + 1]}"` : ''} class="page-link">${i18n('next')}</a>
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
    })
    .catch(error => { console.log(error) });
})()
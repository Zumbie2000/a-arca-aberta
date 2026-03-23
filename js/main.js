/* ============================================
   main.js — navegação, scroll reveal, animações
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── NAVBAR SCROLL ──
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  // ── WAVE LETTER EFFECT (botão Abrir a Arca) ──
  const waveBtn = document.getElementById('waveBtn');
  if (waveBtn) {
    const text = waveBtn.textContent;
    waveBtn.innerHTML = text.split('').map((char, i) =>
      char === ' '
        ? ' '
        : `<span style="animation-delay:${i * 0.07}s">${char}</span>`
    ).join('');
  }

  // ── MOBILE MENU ──
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const mobLinks = document.querySelectorAll('.mob-link');

  toggle.addEventListener('click', () => mobileMenu.classList.add('open'));
  mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobLinks.forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  // ── SCROLL REVEAL ──
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  reveals.forEach(el => revealObserver.observe(el));

  // ── CONTROLE DE SCROLL E NAVEGAÇÃO ──
  const sections = Array.from(document.querySelectorAll('section'));
  const navLinks = document.querySelectorAll('.nav-links a');
  const mobileMenuLinks = document.querySelectorAll('.mob-link');
  const scrollProgressBar = document.getElementById('scrollProgressBar');

  let currentSectionIndex = 0;

  // Atualizar barra de progresso no scroll
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${scrollPercent}%`;
    }
  });

  const highlightNav = (id) => {
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${id}`;
      if (isActive) {
        link.classList.add('active-nav');
      } else {
        link.classList.remove('active-nav');
      }
    });
  };

  // IntersectionObserver para destacar navegação e saber qual seção ler (TTS)
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const newIndex = sections.indexOf(entry.target);
        if (newIndex !== currentSectionIndex) {
          currentSectionIndex = newIndex;
          if (entry.target.id) highlightNav(entry.target.id);
          // Se a leitura estiver ativa, lê a nova seção automaticamente
          if (ttsActive) {
            speakCurrentSection();
          }
        }
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => sectionObserver.observe(sec));

  const goToSectionById = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const setupNavLinks = (links) => {
    links.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        goToSectionById(targetId);
        mobileMenu.classList.remove('open');
      });
    });
  };

  setupNavLinks(navLinks);
  setupNavLinks(mobileMenuLinks);

  // ── ACCESSIBILITY (TTS / LEITURA) ──
  const accessToggle = document.getElementById('accessToggle');
  const stopSpeechBtn = document.getElementById('stopSpeech');
  let ttsActive = false;
  let ttsUtterance = null;
  let narrationQueue = [];
  let queueIndex = 0;

  const getBestVoice = () => {
    const voices = speechSynthesis.getVoices();
    
    if (!voices || voices.length === 0) {
      console.warn('Nenhuma voz disponível no sistema');
      return null;
    }

    // 1ª prioridade: voz masculina confirmada no sistema
    const daniel = voices.find(v => v.name === 'Microsoft Daniel - Portuguese (Brazil)');
    if (daniel) return daniel;

    // 2ª prioridade: qualquer voz pt-BR que não seja feminina
    const anyMale = voices.find(v =>
      v.lang === 'pt-BR' &&
      !v.name.includes('Maria') &&
      !v.name.includes('Francisca') &&
      !v.name.includes('Luciana') &&
      !v.name.toLowerCase().includes('female')
    );
    if (anyMale) return anyMale;

    // Fallback: qualquer pt-BR, depois pt, depois primeira disponível
    return voices.find(v => v.lang === 'pt-BR') ||
           voices.find(v => v.lang.startsWith('pt')) ||
           voices[0] || null;
  };

  // Pré-processa o texto para leitura mais natural e humana
  const humanizeText = (text) => {
    return text
      .replace(/([.!?])\s+/g, '$1  ')
      .replace(/([—:\-])\s+/g, '$1 ')
      .replace(/✦|✔|❌|🚨/g, '')
      .replace(/\s{3,}/g, '  ')
      .trim();
  };

  const collectSectionQueue = () => {
    const active = sections[currentSectionIndex];
    if (!active) return [];

    const selector = 'h1, h2, h3, h4, h5, h6, p, li, blockquote, cite, figcaption, dt, dd, label, img, .highlight-box, .big-quote, .quote-body, .quote-footer, .manifesto-text, .inline-quote, .subtext';

    const queue = [];
    active.querySelectorAll(selector).forEach(item => {
      if (item.closest('button, nav, .read-controls-top, .aviso-modal, .mobile-menu, #quizOptions, .quiz-custom, .scoreboard')) return;

      if (item.tagName.toLowerCase() === 'img') {
        const description = item.getAttribute('data-description') || item.getAttribute('alt');
        const internalText = item.getAttribute('data-internal-text');
        
        if (description || internalText) {
          queue.push({
            type: 'image',
            element: item,
            description: description || '',
            internalText: internalText || ''
          });
        }
        return;
      }

      if (item.querySelector('h1,h2,h3,h4,h5,h6,p,li,blockquote,cite')) return;

      const text = item.textContent.trim();
      if (text.length > 2) {
        queue.push({ type: 'text', content: humanizeText(text) });
      }
    });

    return queue;
  };

  const stopSpeech = () => {
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
    }
    ttsUtterance = null;
    narrationQueue = [];
    queueIndex = 0;
  };

  const processQueue = () => {
    if (!ttsActive || queueIndex >= narrationQueue.length) {
      if (ttsActive && currentSectionIndex < sections.length - 1) {
        const nextSection = sections[currentSectionIndex + 1];
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
      return;
    }

    const block = narrationQueue[queueIndex];
    
    if (block.type === 'text') {
      ttsUtterance = new SpeechSynthesisUtterance(block.content);
      setupUtterance(ttsUtterance);
      ttsUtterance.onend = () => {
        queueIndex++;
        processQueue();
      };
      ttsUtterance.onerror = (error) => {
        console.error('Erro na síntese de fala:', error);
        queueIndex++;
        processQueue();
      };
      speechSynthesis.speak(ttsUtterance);
    } else if (block.type === 'image') {
      const hasInternal = block.internalText && block.internalText.length > 0;
      
      const startReading = () => {
        let textToRead = "";
        if (block.description) textToRead += `Descrição da imagem: ${block.description}. `;
        if (hasInternal) textToRead += `Texto identificado na imagem: ${block.internalText}`;
        
        ttsUtterance = new SpeechSynthesisUtterance(textToRead);
        setupUtterance(ttsUtterance);
        
        ttsUtterance.onend = () => {
          if (hasInternal) {
            collapseImage(block.element);
            setTimeout(() => {
              queueIndex++;
              processQueue();
            }, 800);
          } else {
            queueIndex++;
            processQueue();
          }
        };
        ttsUtterance.onerror = (error) => {
          console.error('Erro na síntese de fala:', error);
          queueIndex++;
          processQueue();
        };
        speechSynthesis.speak(ttsUtterance);
      };

      if (hasInternal) {
        expandImage(block.element);
        setTimeout(startReading, 1000);
      } else {
        startReading();
      }
    }
  };

  const setupUtterance = (utterance) => {
    utterance.lang = 'pt-BR';
    utterance.rate = 0.70;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    const voice = getBestVoice();
    if (voice) {
      utterance.voice = voice;
    }
  };

  const speakCurrentSection = () => {
    if (!('speechSynthesis' in window)) {
      console.error('Leitura por voz não é suportada neste navegador');
      accessToggle.textContent = '🔊 Leitura (Não suportado)';
      return;
    }

    stopSpeech();
    narrationQueue = collectSectionQueue();
    queueIndex = 0;

    if (narrationQueue.length === 0) return;

    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = () => {
        processQueue();
        speechSynthesis.onvoiceschanged = null;
      };
    } else {
      processQueue();
    }
  };

  accessToggle.addEventListener('click', () => {
    ttsActive = !ttsActive;
    accessToggle.textContent = ttsActive ? '🔊 Leitura ON' : '🔊 Leitura';

    if (ttsActive) {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
      speakCurrentSection();
    } else {
      stopSpeech();
    }
  });

  stopSpeechBtn.addEventListener('click', () => {
    ttsActive = false;
    accessToggle.textContent = '🔊 Leitura';
    stopSpeech();
  });

  currentSectionIndex = 0;

  // ── IMAGE EXPAND/COLLAPSE ──
  const overlay = document.createElement('div');
  overlay.className = 'image-overlay';
  document.body.appendChild(overlay);

  let currentExpandedImg = null;

  document.querySelectorAll('.slide-img, .full-slide-img, .metaphor-img').forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();

      if (currentExpandedImg === img) {
        collapseImage(img);
      } else {
        expandImage(img);
      }
    });
  });

  overlay.addEventListener('click', () => {
    if (currentExpandedImg) collapseImage(currentExpandedImg);
  });

  function expandImage(img) {
    if (currentExpandedImg && currentExpandedImg !== img) {
      collapseImage(currentExpandedImg);
    }

    currentExpandedImg = img;
    img.classList.add('expanded');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function collapseImage(imgWrap) {
    if (!imgWrap) return;

    const img = imgWrap.querySelector('.slide-img') || imgWrap;
    const effectName = img.dataset.closeEffect || 'zoom-blur';
    const effectClass = `close-${effectName}`;

    imgWrap.classList.remove('expanded');
    imgWrap.classList.add(effectClass);

    if (overlay.classList.contains('active')) {
      overlay.classList.remove('active');
    }
    document.body.style.overflow = '';

    setTimeout(() => {
      imgWrap.classList.remove(effectClass);
      imgWrap.style.left = '';
      imgWrap.style.top = '';
      imgWrap.style.width = '';
      imgWrap.style.height = '';
      imgWrap.style.position = '';
      imgWrap.style.zIndex = '';
      currentExpandedImg = null;
    }, 650);
  }

  // Fechar com a tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentExpandedImg) {
      collapseImage(currentExpandedImg);
    }
  });

  // ── AVISO ABRIR A ARCA ──
  const btnAbrirArca = document.querySelector('a[href="#manifesto"].btn-gold');
  const avisoModal = document.getElementById('avisoModal');
  const avisoBtn = document.getElementById('avisoBtn');
  const avisoTexto = document.getElementById('avisoTexto');

  if (btnAbrirArca && avisoModal && avisoBtn && avisoTexto) {
    btnAbrirArca.addEventListener('click', (e) => {
      e.preventDefault();
      avisoModal.classList.add('active');
    });

    avisoBtn.addEventListener('click', () => {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');

      avisoTexto.classList.remove('neon');
      avisoTexto.classList.add('wave');
      avisoTexto.textContent = "vamos começar a viagem";
      avisoBtn.style.display = "none";
      setTimeout(() => {
        avisoModal.classList.remove('active');
        setTimeout(() => {
          avisoTexto.classList.remove('wave');
          avisoTexto.classList.add('neon');
          avisoTexto.textContent = "Para visualizar melhor as imagens, toque ou clique nelas";
          avisoBtn.style.display = "inline-block";
          goToSectionById('manifesto');
        }, 400);
      }, 3000);
    });
  }
});

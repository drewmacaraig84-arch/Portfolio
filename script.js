/**
 * Portfolio Interactive Scripts
 * Standards: UI/UX Pro Max Motion & Accessibility
 * Author: Drew Macaraig
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavbar();
    initSoundEffects();
    initScrollReveal();
    initArchitecturePipeline();
    initSkillFilters();
    initSkillsSearch();
    initCertificateFilters();
    initCertsSearch();
    initCertificateModal();
    initCertificateCopy();
    initProjectSpecsAccordion();
    initCopyEmail();
    initGitHubStats();
});

/* ==========================================================================
   1. THEME SWITCHER (DARK / LIGHT MODE)
   ========================================================================== */
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('drew_portfolio_theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'dark'); // Default to sleek dark mode
    root.setAttribute('data-theme', initialTheme);
    
    function updateMetaTheme(theme) {
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'light' ? '#f8fafc' : '#0a0e17');
        }
    }
    updateMetaTheme(initialTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('drew_portfolio_theme', newTheme);
            updateMetaTheme(newTheme);
        });
    }
}

/* ==========================================================================
   2. NAVBAR SCROLL & ACTIVE LINK SCROLLSPY & MOBILE MENU
   ========================================================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobilePanel = document.getElementById('mobile-panel');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Navbar shadow on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile drawer toggle
    function toggleMobileMenu(open) {
        const isOpen = open !== undefined ? open : !hamburgerBtn.classList.contains('open');
        hamburgerBtn.classList.toggle('open', isOpen);
        mobileOverlay.classList.toggle('open', isOpen);
        mobilePanel.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => toggleMobileMenu());
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => toggleMobileMenu(false));
    }

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => toggleMobileMenu(false));
    });

    // Scrollspy for active link indicator
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${currentId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
}

/* ==========================================================================
   3. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveal() {
    const revealItems = document.querySelectorAll('.reveal-item');
    if (!revealItems.length) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        revealItems.forEach(item => item.classList.add('revealed'));
        return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
                // Subtle stagger
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, idx * 30);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '100px 0px 100px 0px'
    });

    revealItems.forEach(item => revealObserver.observe(item));

    // Reveal section items if page loaded with a hash or on nav click
    function revealTargetSection() {
        if (window.location.hash) {
            const targetSec = document.querySelector(window.location.hash);
            if (targetSec) {
                targetSec.querySelectorAll('.reveal-item').forEach(el => el.classList.add('revealed'));
            }
        }
    }
    revealTargetSection();
    window.addEventListener('hashchange', revealTargetSection);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', () => {
            const targetId = anchor.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    targetEl.querySelectorAll('.reveal-item').forEach(el => el.classList.add('revealed'));
                }
            }
        });
    });
}

/* ==========================================================================
   4. TECH STACK FILTERABLE TABS
   ========================================================================== */
function initSkillFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            skillCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 20);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 200);
                }
            });
        });
    });
}

/* Toast notification helper */
function triggerToast(message) {
    const toast = document.getElementById('toast-notice');
    if (!toast) return;
    const textSpan = toast.querySelector('span');
    if (textSpan && message) {
        textSpan.textContent = message;
    }
    toast.classList.add('show');
    clearTimeout(window.__toastTimeout);
    window.__toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

/* ==========================================================================
   5. CERTIFICATION & BADGE FILTERABLE TABS
   ========================================================================== */
function initCertificateFilters() {
    const filterButtons = document.querySelectorAll('.cert-filter-btn');
    const certCards = document.querySelectorAll('.cert-card');

    if (!filterButtons.length) return;

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            certCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const categories = cardCategory ? cardCategory.split(' ') : [];
                const matches = filterValue === 'all' || categories.includes(filterValue);

                if (matches) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 20);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 200);
                }
            });
        });
    });
}

/* ==========================================================================
   6. CERTIFICATE LIGHTBOX MODAL & PREVIEW
   ========================================================================== */
function initCertificateModal() {
    const modalBackdrop = document.getElementById('cert-modal');
    if (!modalBackdrop) return;

    const closeBtn = document.getElementById('cert-modal-close');
    const modalImg = document.getElementById('cert-modal-img');
    const modalTitle = document.getElementById('cert-modal-title');
    const modalSubtitle = document.getElementById('cert-modal-subtitle');
    const modalIssuer = document.getElementById('cert-modal-issuer');
    const modalDate = document.getElementById('cert-modal-date');
    const modalCode = document.getElementById('cert-modal-code');
    const modalSkills = document.getElementById('cert-modal-skills');
    const modalPdfBtn = document.getElementById('cert-modal-pdf');
    const modalCopyBtn = document.getElementById('cert-modal-copy-btn');

    let currentCertCode = '';

    function openModal(data) {
        currentCertCode = data.code || '';
        if (modalImg) {
            modalImg.src = data.img;
            modalImg.alt = `${data.title} Certificate Preview`;
        }
        if (modalTitle) modalTitle.textContent = data.title;
        if (modalSubtitle) modalSubtitle.textContent = `${data.issuer} • ${data.date}`;
        if (modalIssuer) modalIssuer.textContent = data.issuer;
        if (modalDate) modalDate.textContent = data.date;
        if (modalCode) modalCode.textContent = data.code || 'Official Credential';
        
        if (modalSkills) {
            modalSkills.innerHTML = data.skills
                .filter(s => s.trim().length > 0)
                .map(s => `<span class="cert-skill-tag">${s.trim()}</span>`)
                .join(' ');
        }

        if (modalPdfBtn) {
            if (data.pdf && data.pdf.trim() !== '') {
                modalPdfBtn.href = data.pdf;
                modalPdfBtn.style.display = 'inline-flex';
            } else {
                modalPdfBtn.style.display = 'none';
            }
        }

        modalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Modal copy code button
    if (modalCopyBtn) {
        modalCopyBtn.addEventListener('click', async () => {
            if (!currentCertCode) return;
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(currentCertCode);
                }
                triggerToast(`Credential code copied: ${currentCertCode}`);
            } catch (err) {
                console.warn('Could not copy code:', err);
            }
        });
    }

    // Bind triggers on all cards
    document.querySelectorAll('[data-cert-target]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const card = trigger.closest('.cert-card');
            if (!card) return;

            const certData = {
                title: card.dataset.title || '',
                issuer: card.dataset.issuer || '',
                date: card.dataset.date || '',
                code: card.dataset.code || '',
                img: card.dataset.img || '',
                pdf: card.dataset.pdf || '',
                skills: (card.dataset.skills || '').split(',')
            };

            openModal(certData);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            closeModal();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   7. CREDENTIAL CODE CLIPBOARD COPY
   ========================================================================== */
function initCertificateCopy() {
    const copyButtons = document.querySelectorAll('.cert-copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const codeToCopy = btn.getAttribute('data-code');
            if (!codeToCopy) return;

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(codeToCopy);
                } else {
                    const temp = document.createElement('input');
                    temp.value = codeToCopy;
                    document.body.appendChild(temp);
                    temp.select();
                    document.execCommand('copy');
                    document.body.removeChild(temp);
                }
                triggerToast(`Credential code (${codeToCopy}) copied!`);
            } catch (err) {
                console.warn('Copy error: ', err);
            }
        });
    });
}

/* ==========================================================================
   8. INTERACTIVE EMAIL CLIPBOARD COPY
   ========================================================================== */
function initCopyEmail() {
    const copyBtn = document.getElementById('copy-email-btn');
    const emailToCopy = 'macaraigdrew99@gmail.com';

    if (!copyBtn) return;

    copyBtn.addEventListener('click', async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(emailToCopy);
            } else {
                // Fallback for older browsers
                const tempInput = document.createElement('input');
                tempInput.value = emailToCopy;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
            }

            triggerToast('Email copied to clipboard!');
        } catch (err) {
            console.warn('Could not copy text: ', err);
            window.location.href = `mailto:${emailToCopy}`;
        }
    });
}

/* ==========================================================================
   SOUND EFFECTS SYNTHESIZER (WEB AUDIO API)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = localStorage.getItem('drew_portfolio_sound') !== 'muted';

function playUIAudio(freq = 600, duration = 0.05, type = 'sine') {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.45, audioCtx.currentTime + duration);
        gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
}

window.playUIAudio = playUIAudio;

function initSoundEffects() {
    const soundToggle = document.getElementById('sound-toggle');
    if (!soundToggle) return;

    if (!soundEnabled) {
        soundToggle.classList.add('muted');
        soundToggle.setAttribute('aria-pressed', 'false');
    } else {
        soundToggle.setAttribute('aria-pressed', 'true');
    }

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('drew_portfolio_sound', soundEnabled ? 'active' : 'muted');
        soundToggle.classList.toggle('muted', !soundEnabled);
        soundToggle.setAttribute('aria-pressed', String(soundEnabled));
        if (soundEnabled) {
            playUIAudio(750, 0.08, 'triangle');
            triggerToast('UI Audio effects enabled');
        } else {
            triggerToast('UI Audio effects muted');
        }
    });

    // Tactile sound on interactive buttons and tabs
    document.querySelectorAll('.btn, .filter-btn, .cert-filter-btn, .terminal-tab, .shell-chip').forEach(el => {
        el.addEventListener('click', () => playUIAudio(580, 0.04));
    });
}

/* ==========================================================================
   INTERACTIVE ARCHITECTURE PIPELINE (BENTO GRID 2.0)
   ========================================================================== */
function initArchitecturePipeline() {
    const pipeline = document.getElementById('arch-pipeline');
    const titleEl = document.getElementById('arch-detail-title');
    const descEl = document.getElementById('arch-detail-desc');
    if (!pipeline || !titleEl || !descEl) return;

    const ARCH_DATA = {
        client: {
            title: '01 · Client Layer (Reactive & Accessible)',
            desc: 'Crafted with semantic HTML5, reactive Livewire/React components, zero bloat, and sub-100ms client rendering for responsive multi-device engagement.'
        },
        security: {
            title: '02 · Security & RBAC Defense',
            desc: 'Strict CSRF token validation on all mutating routes, rate-limiting handlers, session rotation, and multi-tier Role-Based Access Control (Admin, Faculty, Student, Member).'
        },
        engine: {
            title: '03 · Core Application Engine',
            desc: 'Built with PHP 8.3 & Laravel with modular service repositories, clean controller abstractions, transactional integrity, and automated background jobs.'
        },
        data: {
            title: '04 · Database & Cache Architecture',
            desc: 'Dual database architecture (MySQL in production, SQLite for isolated testing) with indexed queries achieving <80ms latency and normalized schemas.'
        }
    };

    const nodes = pipeline.querySelectorAll('.arch-node');
    nodes.forEach(node => {
        node.addEventListener('click', () => {
            const key = node.dataset.arch;
            if (!key || !ARCH_DATA[key]) return;

            nodes.forEach(n => {
                const isActive = n === node;
                n.classList.toggle('active', isActive);
                n.setAttribute('aria-selected', String(isActive));
            });

            titleEl.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                <span>${ARCH_DATA[key].title}</span>
            `;
            descEl.textContent = ARCH_DATA[key].desc;
            playUIAudio(650, 0.05, 'triangle');
        });
    });
}

/* ==========================================================================
   SKILLS LIVE SEARCH FILTER
   ========================================================================== */
function initSkillsSearch() {
    const searchInput = document.getElementById('skills-search');
    const clearBtn = document.getElementById('skills-search-clear');
    const skillCards = document.querySelectorAll('#skills-grid .skill-card');
    if (!searchInput || !skillCards.length) return;

    function applySearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (clearBtn) clearBtn.hidden = !query;

        skillCards.forEach(card => {
            const name = card.querySelector('.skill-name')?.textContent.toLowerCase() || '';
            const category = card.querySelector('.skill-category')?.textContent.toLowerCase() || '';
            const matches = !query || name.includes(query) || category.includes(query);
            card.hidden = !matches;
        });
    }

    searchInput.addEventListener('input', applySearch);

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            applySearch();
            searchInput.focus();
            playUIAudio(400, 0.04);
        });
    }
}

/* ==========================================================================
   CERTIFICATES LIVE SEARCH FILTER
   ========================================================================== */
function initCertsSearch() {
    const searchInput = document.getElementById('certs-search');
    const clearBtn = document.getElementById('certs-search-clear');
    const certCards = document.querySelectorAll('#certs-container .cert-card');
    if (!searchInput || !certCards.length) return;

    function applySearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (clearBtn) clearBtn.hidden = !query;

        certCards.forEach(card => {
            const title = (card.dataset.title || '').toLowerCase();
            const issuer = (card.dataset.issuer || '').toLowerCase();
            const code = (card.dataset.code || '').toLowerCase();
            const skills = (card.dataset.skills || '').toLowerCase();
            const matches = !query || title.includes(query) || issuer.includes(query) || code.includes(query) || skills.includes(query);
            card.hidden = !matches;
        });
    }

    searchInput.addEventListener('input', applySearch);

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            applySearch();
            searchInput.focus();
            playUIAudio(400, 0.04);
        });
    }
}

/* ==========================================================================
   PROJECT TECHNICAL ARCHITECTURE ACCORDION
   ========================================================================== */
function initProjectSpecsAccordion() {
    const toggles = document.querySelectorAll('.project-specs-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const panelId = toggle.getAttribute('aria-controls');
            const panel = panelId ? document.getElementById(panelId) : null;
            if (!panel) return;

            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!isExpanded));
            panel.hidden = isExpanded;
            playUIAudio(isExpanded ? 480 : 640, 0.04);
        });
    });
}

/* ==========================================================================
   6. GITHUB REPOSITORIES LIVE STATUS CHECK (NON-BLOCKING)
   ========================================================================== */
async function initGitHubStats() {
    const GITHUB_USERNAME = 'drewmacaraig84-arch';
    
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        });

        if (!response.ok) return;

        const repos = await response.json();
        if (!Array.isArray(repos) || repos.length === 0) return;

        // Map live stargazers/stats if applicable
        repos.forEach(repo => {
            const cardLinks = document.querySelectorAll(`a[href*="${repo.name}"]`);
            cardLinks.forEach(link => {
                const card = link.closest('.project-card');
                if (card && repo.stargazers_count > 0) {
                    const statsMeta = card.querySelector('.project-stats-meta');
                    if (statsMeta) {
                        statsMeta.innerHTML += ` <span>★ ${repo.stargazers_count}</span>`;
                    }
                }
            });
        });
    } catch (e) {
        // Silent graceful fallback, curated projects remain perfectly visible
        console.info('GitHub live stats loaded in offline/curated mode.');
    }
}

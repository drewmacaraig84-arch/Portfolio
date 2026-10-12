/**
 * Portfolio Interactive Scripts
 * Standards: UI/UX Pro Max Motion & Accessibility
 * Author: Drew Macaraig
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavbar();
    initScrollReveal();
    initSkillFilters();
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

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('drew_portfolio_theme', newTheme);
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
                }, idx * 40);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealItems.forEach(item => revealObserver.observe(item));
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

/* ==========================================================================
   5. INTERACTIVE EMAIL CLIPBOARD COPY
   ========================================================================== */
function initCopyEmail() {
    const copyBtn = document.getElementById('copy-email-btn');
    const toast = document.getElementById('toast-notice');
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

            // Show Toast feedback
            if (toast) {
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2600);
            }
        } catch (err) {
            console.warn('Could not copy text: ', err);
            window.location.href = `mailto:${emailToCopy}`;
        }
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

/* ==========================================================================
   INTERACTIVE LAYER - DREW MACARAIG
   1. Shared helpers      4. 3D tilt + holographic sheen
   2. Shell terminal      5. Cursor spotlight
   3. Command palette     6. Confetti
   Depends on triggerToast() from script.js.
   ========================================================================== */
(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const EMAIL = 'macaraigdrew99@gmail.com';
    const GITHUB = 'https://github.com/drewmacaraig84-arch';

    const PROJECTS = [
        {
            key: 'scj',
            name: 'School of Criminal Justice (SCJ) System',
            live: 'http://dwcc-scj.site.je/index.php',
            repo: `${GITHUB}/SCJ`,
            stack: 'PHP 8.3, MySQL/SQLite, CSRF middleware, RBAC'
        },
        {
            key: 'amiga',
            name: 'AmigaTravel Tour & Booking Platform',
            live: 'https://www.amigagracia.com/',
            repo: `${GITHUB}/AmigaTravel`,
            stack: 'Laravel 13, Livewire 3, Filament v3, Tailwind'
        },
        {
            key: 'uap',
            name: 'UAP-MC Architectural Chapter Portal',
            live: 'https://uap-mindorochapter.up.railway.app/',
            repo: `${GITHUB}/uap_mc`,
            stack: 'PHP, MySQL, JavaScript, Railway'
        }
    ];

    const SECTIONS = {
        home: 'home',
        about: 'about',
        skills: 'skills',
        stack: 'skills',
        projects: 'projects',
        certs: 'certificates',
        certificates: 'certificates',
        experience: 'experience',
        contact: 'contact'
    };

    /* ======================================================================
       1. SHARED HELPERS
       ====================================================================== */
    function toast(message) {
        if (typeof window.triggerToast === 'function') window.triggerToast(message);
    }

    async function copyText(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (_) { /* fall through to legacy copy */ }
        const temp = document.createElement('textarea');
        temp.value = text;
        temp.setAttribute('readonly', '');
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        const ok = document.execCommand('copy');
        temp.remove();
        return ok;
    }

    function openExternal(url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    function goToSection(id) {
        const section = document.getElementById(id);
        if (!section) return false;
        section.querySelectorAll('.reveal-item').forEach(el => el.classList.add('revealed'));
        section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        if (!prefersReducedMotion) {
            section.classList.remove('section-flash');
            void section.offsetWidth;
            section.classList.add('section-flash');
            setTimeout(() => section.classList.remove('section-flash'), 1300);
        }
        return true;
    }

    function toggleTheme(force) {
        const root = document.documentElement;
        const current = root.getAttribute('data-theme') || 'dark';
        const next = force || (current === 'dark' ? 'light' : 'dark');
        root.setAttribute('data-theme', next);
        localStorage.setItem('drew_portfolio_theme', next);
        return next;
    }

    function getCertificates() {
        return Array.from(document.querySelectorAll('.cert-card')).map(card => ({
            title: card.dataset.title || '',
            issuer: card.dataset.issuer || '',
            date: card.dataset.date || '',
            open: () => {
                goToSection('certificates');
                const trigger = card.querySelector('.cert-inspect-btn');
                if (trigger) setTimeout(() => trigger.click(), prefersReducedMotion ? 0 : 450);
            }
        }));
    }

    async function hire() {
        celebrate();
        const copied = await copyText(EMAIL);
        toast(copied ? `Email copied: ${EMAIL}` : `Reach Drew at ${EMAIL}`);
        return copied;
    }

    /* ======================================================================
       2. SHELL TERMINAL
       ====================================================================== */
    const terminal = (() => {
        const card = document.getElementById('hero-terminal');
        if (!card) return null;

        const tabs = Array.from(card.querySelectorAll('.terminal-tab'));
        const panes = Array.from(card.querySelectorAll('.terminal-pane'));
        const output = document.getElementById('shell-output');
        const form = document.getElementById('shell-form');
        const input = document.getElementById('shell-input');
        const openBtn = document.getElementById('terminal-open-shell');

        const history = [];
        let historyIndex = -1;
        let booted = false;

        // ---- output primitives (textContent only: user input is never parsed as HTML)
        function line(segments, extraClass) {
            const row = document.createElement('div');
            row.className = 'shell-line' + (extraClass ? ` ${extraClass}` : '');
            (Array.isArray(segments) ? segments : [segments]).forEach(seg => {
                if (seg instanceof Node) {
                    row.appendChild(seg);
                    return;
                }
                const [text, cls] = Array.isArray(seg) ? seg : [seg, ''];
                const span = document.createElement('span');
                if (cls) span.className = cls;
                span.textContent = text;
                row.appendChild(span);
            });
            output.appendChild(row);
            output.scrollTop = output.scrollHeight;
            return row;
        }

        function gap() {
            const spacer = document.createElement('div');
            spacer.className = 'shell-gap';
            output.appendChild(spacer);
        }

        function actionLink(label, onClick) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'shell-link';
            btn.textContent = label;
            btn.addEventListener('click', onClick);
            return btn;
        }

        function echo(cmd) {
            line([['drew@portfolio:~$ ', 'sh-prompt'], [cmd, 'sh-cmd']]);
        }

        // ---- commands
        const commands = {
            help: {
                desc: 'List available commands',
                run() {
                    line([['Available commands', 'sh-strong']]);
                    Object.entries(commands)
                        .filter(([, c]) => !c.hidden)
                        .forEach(([name, c]) => {
                            line([['  ' + name.padEnd(12), 'sh-accent'], [c.desc, 'sh-muted']]);
                        });
                    line([['Tip: ', 'sh-muted'], ['Tab', 'sh-info'], [' autocompletes, ', 'sh-muted'], ['Up/Down', 'sh-info'], [' walks history, ', 'sh-muted'], ['Ctrl K', 'sh-info'], [' opens search.', 'sh-muted']]);
                }
            },
            whoami: {
                desc: 'Who is Drew?',
                run() {
                    line([['Drew Marion F. Macaraig', 'sh-strong']]);
                    line([['Full-stack software developer, Philippines (GMT+8).', '']]);
                    line([['Builds secure PHP/Laravel back ends and fast, clean front ends.', 'sh-muted']]);
                }
            },
            skills: {
                desc: 'Print the tech stack as a tree',
                run() {
                    line([['stack/', 'sh-info']]);
                    line([['├── backend/   ', 'sh-accent'], ['PHP 8+, Laravel, Livewire, Node.js, Express']]);
                    line([['├── data/      ', 'sh-accent'], ['MySQL, SQLite, SQL']]);
                    line([['├── frontend/  ', 'sh-accent'], ['JavaScript (ES6+), React, Tailwind CSS, HTML5/CSS3']]);
                    line([['├── security/  ', 'sh-accent'], ['CSRF protection, RBAC, rate limiting, CSP headers']]);
                    line([['└── tooling/   ', 'sh-accent'], ['Git, GitHub, Apache, Laragon, Railway']]);
                }
            },
            projects: {
                desc: 'List live projects',
                run() {
                    PROJECTS.forEach((p, i) => {
                        line([[`[${i + 1}] `, 'sh-warn'], [p.name, 'sh-strong']]);
                        line([['    ' + p.stack, 'sh-muted']]);
                    });
                    line([
                        ['Run ', 'sh-muted'], ['open 1', 'sh-info'], [' for a live demo, ', 'sh-muted'],
                        ['source 1', 'sh-info'], [' for code, or ', 'sh-muted'],
                        actionLink('jump to projects', () => goToSection('projects'))
                    ]);
                }
            },
            open: {
                desc: 'open <1-3> : launch a live demo',
                run(args) {
                    const project = findProject(args[0]);
                    if (!project) return line([['Usage: open <1-3>. Run `projects` to see the list.', 'sh-warn']]);
                    line([['Launching ', 'sh-muted'], [project.name, 'sh-ok'], ['...', 'sh-muted']]);
                    openExternal(project.live);
                }
            },
            source: {
                desc: 'source <1-3> : view the code on GitHub',
                run(args) {
                    const project = findProject(args[0]);
                    if (!project) return line([['Usage: source <1-3>', 'sh-warn']]);
                    line([['Opening repository for ', 'sh-muted'], [project.name, 'sh-ok']]);
                    openExternal(project.repo);
                }
            },
            certs: {
                desc: 'List verified certifications',
                run() {
                    getCertificates().forEach((c, i) => {
                        line([[`[${i + 1}] `, 'sh-warn'], [c.title, 'sh-strong']]);
                        line([[`    ${c.issuer.split('•')[0].trim()}, ${c.date}`, 'sh-muted']]);
                    });
                    line([['Run ', 'sh-muted'], ['cert 1', 'sh-info'], [' to inspect one.', 'sh-muted']]);
                }
            },
            cert: {
                desc: 'cert <n> : open a certificate preview',
                hidden: true,
                run(args) {
                    const list = getCertificates();
                    const index = parseInt(args[0], 10) - 1;
                    if (!list[index]) return line([[`Usage: cert <1-${list.length}>`, 'sh-warn']]);
                    line([['Opening ', 'sh-muted'], [list[index].title, 'sh-ok']]);
                    list[index].open();
                }
            },
            goto: {
                desc: 'goto <section> : scroll the page',
                run(args) {
                    const target = SECTIONS[(args[0] || '').toLowerCase()];
                    if (!target) {
                        return line([['Sections: ', 'sh-muted'], [Object.keys(SECTIONS).filter(k => k !== 'stack' && k !== 'certs').join(', '), 'sh-info']]);
                    }
                    line([['Scrolling to ', 'sh-muted'], [target, 'sh-ok']]);
                    goToSection(target);
                }
            },
            contact: {
                desc: 'How to reach Drew',
                run() {
                    line([['email   ', 'sh-accent'], [EMAIL]]);
                    line([['github  ', 'sh-accent'], [GITHUB.replace('https://', '')]]);
                    line([
                        ['Run ', 'sh-muted'], ['copy email', 'sh-info'], [' or ', 'sh-muted'], ['mail', 'sh-info'],
                        ['. Or just ', 'sh-muted'], ['hire', 'sh-ok'], ['.', 'sh-muted']
                    ]);
                }
            },
            copy: {
                desc: 'copy email : copy the address',
                hidden: true,
                async run(args) {
                    if ((args[0] || 'email') !== 'email') return line([['Only `copy email` is supported.', 'sh-warn']]);
                    const ok = await copyText(EMAIL);
                    line(ok ? [['Copied ', 'sh-ok'], [EMAIL]] : [['Clipboard blocked. Address: ', 'sh-warn'], [EMAIL]]);
                    if (ok) toast('Email copied to clipboard!');
                }
            },
            mail: {
                desc: 'Compose an email to Drew',
                hidden: true,
                run() {
                    line([['Opening your mail app...', 'sh-muted']]);
                    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Let's work together")}`;
                }
            },
            hire: {
                desc: 'The best command',
                async run() {
                    line([['Initiating hiring sequence...', 'sh-info']]);
                    const copied = await hire();
                    line([['✔ ', 'sh-ok'], ['Great decision. ', 'sh-strong'], [copied ? `Email copied: ${EMAIL}` : `Email: ${EMAIL}`]]);
                    line([['Run ', 'sh-muted'], ['mail', 'sh-info'], [' to write now.', 'sh-muted']]);
                }
            },
            github: {
                desc: 'Open GitHub profile',
                run() {
                    line([['Opening GitHub...', 'sh-muted']]);
                    openExternal(GITHUB);
                }
            },
            theme: {
                desc: 'theme [dark|light] : switch theme',
                run(args) {
                    const want = (args[0] || '').toLowerCase();
                    const next = toggleTheme(want === 'dark' || want === 'light' ? want : undefined);
                    line([['Theme set to ', 'sh-muted'], [next, 'sh-ok']]);
                }
            },
            ls: {
                desc: 'List files',
                run() {
                    line([['about.md  ', ''], ['contact.txt  ', ''], ['skills.json  ', ''], ['projects/  ', 'sh-info'], ['certificates/', 'sh-info']]);
                }
            },
            cat: {
                desc: 'cat <file> : print a file',
                hidden: true,
                run(args) {
                    const file = (args[0] || '').toLowerCase();
                    if (file === 'about.md') return commands.whoami.run();
                    if (file === 'contact.txt') return commands.contact.run();
                    if (file === 'skills.json') {
                        line([['{ "backend": ["PHP", "Laravel", "Livewire", "Node.js"],', 'sh-ok']]);
                        line([['  "frontend": ["JavaScript", "React", "Tailwind CSS"],', 'sh-ok']]);
                        line([['  "data": ["MySQL", "SQLite"] }', 'sh-ok']]);
                        return;
                    }
                    if (file === 'projects/' || file === 'projects') return commands.projects.run();
                    if (file === 'certificates/' || file === 'certificates') return commands.certs.run();
                    line([[`cat: ${args[0] || ''}: No such file. Try \`ls\`.`, 'sh-err']]);
                }
            },
            history: {
                desc: 'Show command history',
                hidden: true,
                run() {
                    if (!history.length) return line([['(empty)', 'sh-muted']]);
                    history.forEach((h, i) => line([[String(i + 1).padStart(3) + '  ', 'sh-muted'], [h]]));
                }
            },
            date: {
                desc: 'Current time in Drew\'s timezone',
                hidden: true,
                run() {
                    const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', dateStyle: 'full', timeStyle: 'short' });
                    line([[time, ''], [' (Manila, GMT+8)', 'sh-muted']]);
                }
            },
            echo: {
                desc: 'Print text',
                hidden: true,
                run(args) { line([[args.join(' ')]]); }
            },
            coffee: {
                desc: 'Refuel',
                hidden: true,
                run() { line([['Brewing... ETA: as soon as the build passes.', 'sh-warn']]); }
            },
            sudo: {
                desc: 'Try it',
                hidden: true,
                run(args) {
                    if (args.join(' ').startsWith('rm')) return commands.rm.run(args.slice(1));
                    line([['[sudo] password for visitor: ', 'sh-muted'], ['********', '']]);
                    line([['visitor is not in the sudoers file. This incident will be reported to Drew.', 'sh-err']]);
                    line([['(Just kidding. Try `hire` instead.)', 'sh-muted']]);
                }
            },
            rm: {
                desc: 'Delete things',
                hidden: true,
                run() {
                    if (!prefersReducedMotion) {
                        card.classList.remove('shake');
                        void card.offsetWidth;
                        card.classList.add('shake');
                    }
                    line([['rm: refusing to delete a portfolio this good.', 'sh-err']]);
                    line([['Permission denied: Drew is already locked in.', 'sh-warn']]);
                }
            },
            clear: {
                desc: 'Clear the screen',
                run() { output.textContent = ''; }
            },
            spin: {
                desc: 'Accelerate the 3D WebGL core',
                run() {
                    if (window.__hero3D) {
                        window.__hero3D.spinRapid();
                        window.__hero3D.pulseCore();
                        line([['[3D Engine] Core acceleration triggered.', 'sh-ok']]);
                    } else {
                        line([['[3D Engine] 3D canvas not active.', 'sh-warn']]);
                    }
                }
            },
            '3d': {
                desc: 'Alias for spin',
                hidden: true,
                run() { return commands.spin.run(); }
            },
            exit: {
                desc: 'Back to profile.ts',
                run() { activate('profile', true); }
            }
        };

        const aliases = { cls: 'clear', '?': 'help', about: 'whoami', certifications: 'certs', cd: 'goto', email: 'contact' };

        function findProject(arg) {
            if (!arg) return null;
            const n = parseInt(arg, 10);
            if (!Number.isNaN(n)) return PROJECTS[n - 1] || null;
            const q = arg.toLowerCase();
            return PROJECTS.find(p => p.key === q || p.name.toLowerCase().includes(q)) || null;
        }

        function suggest(name) {
            const all = Object.keys(commands);
            return all.find(c => c.startsWith(name.slice(0, 2))) || null;
        }

        async function execute(raw, { silent = false } = {}) {
            const text = raw.trim();
            if (!silent) echo(text);
            if (!text) return;

            history.push(text);
            if (history.length > 50) history.shift();
            historyIndex = history.length;

            const [first, ...args] = text.split(/\s+/);
            let name = first.toLowerCase();
            if (aliases[name]) name = aliases[name];

            const command = commands[name];
            if (!command) {
                const guess = suggest(name);
                line([[`command not found: ${first}.`, 'sh-err'], guess ? [` Did you mean \`${guess}\`?`, 'sh-muted'] : [' Type `help`.', 'sh-muted']]);
                gap();
                return;
            }
            await command.run(args);
            gap();
        }

        function boot() {
            booted = true;
            line([['drew-shell v1.0 ', 'sh-strong'], ['(vanilla JS, zero dependencies)', 'sh-muted']]);
            line([['Type ', 'sh-muted'], ['help', 'sh-info'], [' to see what I can do, or tap a command below.', 'sh-muted']]);
            gap();
        }

        function activate(name, focus) {
            tabs.forEach(tab => {
                const on = tab.dataset.pane === name;
                tab.classList.toggle('active', on);
                tab.setAttribute('aria-selected', String(on));
                tab.tabIndex = on ? 0 : -1;
                if (on && name === 'shell') tab.classList.add('visited');
            });
            panes.forEach(pane => {
                const on = pane.dataset.pane === name;
                pane.classList.toggle('active', on);
                pane.setAttribute('aria-hidden', String(!on));
                pane.toggleAttribute('inert', !on);
            });
            if (name === 'shell') {
                if (!booted) boot();
                if (focus) input.focus({ preventScroll: true });
            } else if (focus) {
                tabs.find(t => t.dataset.pane === name)?.focus();
            }
        }

        // ---- wiring
        tabs.forEach((tab, i) => {
            tab.addEventListener('click', () => activate(tab.dataset.pane, tab.dataset.pane === 'shell'));
            tab.addEventListener('keydown', e => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                e.preventDefault();
                const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
                activate(next.dataset.pane, false);
                next.focus();
            });
        });

        openBtn?.addEventListener('click', () => {
            activate('shell', true);
            execute('help');
        });

        form.addEventListener('submit', e => {
            e.preventDefault();
            const value = input.value;
            input.value = '';
            execute(value);
        });

        input.addEventListener('keydown', e => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!history.length) return;
                historyIndex = Math.max(0, historyIndex - 1);
                input.value = history[historyIndex] || '';
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                historyIndex = Math.min(history.length, historyIndex + 1);
                input.value = history[historyIndex] || '';
            } else if (e.key === 'Tab') {
                const partial = input.value.trim().toLowerCase();
                if (!partial || partial.includes(' ')) return;
                const matches = Object.keys(commands).filter(c => c.startsWith(partial));
                if (!matches.length) return;
                e.preventDefault();
                if (matches.length === 1) {
                    input.value = matches[0] + ' ';
                } else {
                    echo(input.value);
                    line([[matches.join('  '), 'sh-info']]);
                }
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                output.textContent = '';
            }
        });

        card.querySelectorAll('.shell-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                execute(chip.dataset.cmd);
                input.focus({ preventScroll: true });
            });
        });

        // Clicking anywhere in the output (except links) focuses the prompt.
        output.addEventListener('click', e => {
            if (!e.target.closest('button') && !window.getSelection().toString()) input.focus({ preventScroll: true });
        });

        return {
            open() {
                goToSection('home');
                activate('shell', true);
            }
        };
    })();

    /* ======================================================================
       3. COMMAND PALETTE (CTRL / CMD + K)
       ====================================================================== */
    (() => {
        const backdrop = document.getElementById('cmdk');
        const input = document.getElementById('cmdk-input');
        const list = document.getElementById('cmdk-list');
        const trigger = document.getElementById('cmdk-trigger');
        if (!backdrop || !input || !list) return;

        const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
        const kbd = trigger?.querySelector('.cmdk-trigger-kbd');
        if (kbd && isMac) kbd.textContent = '⌘K';

        const ICONS = {
            nav: '<path d="M5 12h14M13 6l6 6-6 6"/>',
            live: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/>',
            code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
            cert: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.4L7 22l5-3 5 3-1.2-8.6"/>',
            mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
            copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
            theme: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
            term: '<path d="M4 17l6-6-6-6M12 19h8"/>',
            star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'
        };

        function buildItems() {
            const items = [
                { group: 'Navigate', label: 'Home', icon: 'nav', keywords: 'top hero start', run: () => goToSection('home') },
                { group: 'Navigate', label: 'About', icon: 'nav', keywords: 'bio philosophy', run: () => goToSection('about') },
                { group: 'Navigate', label: 'Tech stack', icon: 'nav', keywords: 'skills technologies tools', run: () => goToSection('skills') },
                { group: 'Navigate', label: 'Projects', icon: 'nav', keywords: 'work portfolio apps', run: () => goToSection('projects') },
                { group: 'Navigate', label: 'Certifications', icon: 'nav', keywords: 'credentials badges', run: () => goToSection('certificates') },
                { group: 'Navigate', label: 'Experience', icon: 'nav', keywords: 'career timeline', run: () => goToSection('experience') },
                { group: 'Navigate', label: 'Contact', icon: 'nav', keywords: 'email reach', run: () => goToSection('contact') }
            ];

            PROJECTS.forEach(p => {
                items.push({ group: 'Projects', label: `Open ${p.name}`, hint: 'Live demo', icon: 'live', keywords: `${p.key} ${p.stack}`, run: () => openExternal(p.live) });
                items.push({ group: 'Projects', label: `Source: ${p.name}`, hint: 'GitHub', icon: 'code', keywords: `${p.key} repo code`, run: () => openExternal(p.repo) });
            });

            getCertificates().forEach(c => {
                items.push({ group: 'Certifications', label: c.title, hint: 'Preview', icon: 'cert', keywords: c.issuer, run: c.open });
            });

            items.push(
                { group: 'Actions', label: 'Hire Drew', hint: 'Copies email', icon: 'star', keywords: 'job offer recruit work', run: hire },
                { group: 'Actions', label: 'Open the interactive shell', icon: 'term', keywords: 'terminal command cli', run: () => terminal?.open() },
                { group: 'Actions', label: 'Copy email address', icon: 'copy', keywords: EMAIL, run: async () => { if (await copyText(EMAIL)) toast('Email copied to clipboard!'); } },
                { group: 'Actions', label: 'Send an email', icon: 'mail', keywords: 'mailto message', run: () => { window.location.href = `mailto:${EMAIL}`; } },
                { group: 'Actions', label: 'Toggle dark / light theme', icon: 'theme', keywords: 'mode appearance', run: () => toast(`Theme: ${toggleTheme()}`) },
                { group: 'Actions', label: 'Open GitHub profile', icon: 'code', keywords: 'repositories', run: () => openExternal(GITHUB) }
            );

            return items.map((item, i) => ({ ...item, id: `cmdk-item-${i}`, haystack: `${item.group} ${item.label} ${item.keywords || ''}`.toLowerCase() }));
        }

        const allItems = buildItems();
        let visible = [];
        let activeIndex = 0;
        let lastFocus = null;

        function render() {
            const tokens = input.value.toLowerCase().split(/\s+/).filter(Boolean);
            visible = allItems.filter(item => tokens.every(t => item.haystack.includes(t)));
            activeIndex = Math.min(activeIndex, Math.max(0, visible.length - 1));
            list.textContent = '';

            if (!visible.length) {
                const empty = document.createElement('li');
                empty.className = 'cmdk-empty';
                empty.setAttribute('role', 'presentation');
                empty.textContent = `No results for "${input.value}". Try "projects" or "email".`;
                list.appendChild(empty);
                input.removeAttribute('aria-activedescendant');
                return;
            }

            let currentGroup = '';
            visible.forEach((item, i) => {
                if (item.group !== currentGroup) {
                    currentGroup = item.group;
                    const header = document.createElement('li');
                    header.className = 'cmdk-group';
                    header.setAttribute('role', 'presentation');
                    header.textContent = item.group;
                    list.appendChild(header);
                }
                const li = document.createElement('li');
                li.className = 'cmdk-item';
                li.id = item.id;
                li.setAttribute('role', 'option');
                li.setAttribute('aria-selected', String(i === activeIndex));

                const icon = document.createElement('span');
                icon.className = 'cmdk-item-icon';
                icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[item.icon] || ICONS.nav}</svg>`;

                const label = document.createElement('span');
                label.className = 'cmdk-item-label';
                label.textContent = item.label;

                li.append(icon, label);
                if (item.hint) {
                    const hint = document.createElement('span');
                    hint.className = 'cmdk-item-hint';
                    hint.textContent = item.hint;
                    li.appendChild(hint);
                }

                li.addEventListener('mousemove', () => {
                    if (activeIndex !== i) setActive(i, false);
                });
                li.addEventListener('click', () => select(i));
                list.appendChild(li);
            });

            setActive(activeIndex, true);
        }

        function setActive(index, scroll) {
            activeIndex = index;
            list.querySelectorAll('.cmdk-item').forEach((el, i) => el.setAttribute('aria-selected', String(i === index)));
            const current = visible[index];
            if (!current) return;
            input.setAttribute('aria-activedescendant', current.id);
            if (scroll) document.getElementById(current.id)?.scrollIntoView({ block: 'nearest' });
        }

        function select(index) {
            const item = visible[index];
            if (!item) return;
            close(false);
            item.run();
        }

        function open() {
            if (!backdrop.hidden) return;
            lastFocus = document.activeElement;
            backdrop.hidden = false;
            document.body.style.overflow = 'hidden';
            input.value = '';
            activeIndex = 0;
            render();
            requestAnimationFrame(() => backdrop.classList.add('open'));
            input.focus();
        }

        function close(restoreFocus = true) {
            if (backdrop.hidden) return;
            backdrop.classList.remove('open');
            document.body.style.overflow = '';
            setTimeout(() => { backdrop.hidden = true; }, prefersReducedMotion ? 0 : 180);
            if (restoreFocus && lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
        }

        input.addEventListener('input', () => { activeIndex = 0; render(); });

        input.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (visible.length) setActive((activeIndex + 1) % visible.length, true);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (visible.length) setActive((activeIndex - 1 + visible.length) % visible.length, true);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                select(activeIndex);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                close();
            } else if (e.key === 'Tab') {
                e.preventDefault(); // keep focus inside the dialog
            }
        });

        backdrop.addEventListener('mousedown', e => {
            if (e.target === backdrop) close();
        });

        trigger?.addEventListener('click', open);

        window.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                backdrop.hidden ? open() : close();
            }
        });
    })();

    /* ======================================================================
       4. 3D TILT + HOLOGRAPHIC SHEEN
       ====================================================================== */
    (() => {
        if (prefersReducedMotion || !finePointer) return;

        document.querySelectorAll('.project-card, .cert-card, .badge-item').forEach(card => {
            const holo = card.matches('.cert-card, .badge-item');
            const maxTilt = card.matches('.badge-item') ? 9 : 6;
            const lift = card.matches('.badge-item') ? -3 : -6;

            const glare = document.createElement('span');
            glare.className = holo ? 'tilt-glare tilt-glare--holo' : 'tilt-glare';
            glare.setAttribute('aria-hidden', 'true');
            card.appendChild(glare);
            card.classList.add('tilt-ready');

            let frame = 0;

            card.addEventListener('pointerenter', () => card.classList.add('is-tilting'));

            card.addEventListener('pointermove', e => {
                cancelAnimationFrame(frame);
                frame = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const px = (e.clientX - rect.left) / rect.width;
                    const py = (e.clientY - rect.top) / rect.height;
                    const rotateX = (0.5 - py) * maxTilt;
                    const rotateY = (px - 0.5) * maxTilt;

                    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(${lift}px)`;
                    card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
                    card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
                    if (holo) {
                        card.style.setProperty('--holo-x', `${(px * 100).toFixed(1)}%`);
                        card.style.setProperty('--holo-y', `${(py * 100).toFixed(1)}%`);
                        card.style.setProperty('--holo-angle', `${(100 + px * 40).toFixed(0)}deg`);
                    }
                });
            });

            card.addEventListener('pointerleave', () => {
                cancelAnimationFrame(frame);
                card.classList.remove('is-tilting');
                card.style.transform = '';
            });
        });
    })();

    /* ======================================================================
       5. CURSOR SPOTLIGHT
       ====================================================================== */
    (() => {
        if (prefersReducedMotion || !finePointer) return;
        const spot = document.querySelector('.cursor-spotlight');
        if (!spot) return;

        let x = 0;
        let y = 0;
        let frame = 0;

        window.addEventListener('pointermove', e => {
            x = e.clientX;
            y = e.clientY;
            if (!spot.classList.contains('active')) spot.classList.add('active');
            if (frame) return;
            frame = requestAnimationFrame(() => {
                spot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                frame = 0;
            });
        }, { passive: true });

        document.documentElement.addEventListener('pointerleave', () => spot.classList.remove('active'));
    })();

    /* ======================================================================
       6. CONFETTI (used by `hire`)
       ====================================================================== */
    function celebrate() {
        if (prefersReducedMotion) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'confetti-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);

        const colors = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
        const originX = window.innerWidth / 2;
        const originY = window.innerHeight * 0.35;

        const pieces = Array.from({ length: 140 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 9;
            return {
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 6,
                size: 5 + Math.random() * 6,
                rotation: Math.random() * Math.PI,
                spin: (Math.random() - 0.5) * 0.3,
                color: colors[(Math.random() * colors.length) | 0]
            };
        });

        const start = performance.now();
        const duration = 2400;

        (function tick(now) {
            const elapsed = now - start;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.globalAlpha = Math.max(0, 1 - elapsed / duration);

            pieces.forEach(p => {
                p.vy += 0.28;
                p.vx *= 0.985;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.spin;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                ctx.restore();
            });

            if (elapsed < duration) requestAnimationFrame(tick);
            else canvas.remove();
        })(start);
    }

    window.__celebrate = celebrate;

    /* ======================================================================
       7. LIVE PHILIPPINE TIME DOCK CLOCK & 3D CONTROLS
       ====================================================================== */
    (() => {
        // 1. Live Clock in Navbar
        const clockEl = document.getElementById('nav-clock-text');
        if (clockEl) {
            function updateClock() {
                try {
                    const timeStr = new Date().toLocaleTimeString('en-US', {
                        timeZone: 'Asia/Manila',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                    clockEl.textContent = `PH ${timeStr}`;
                } catch (e) {
                    clockEl.textContent = 'PH (GMT+8)';
                }
            }
            updateClock();
            setInterval(updateClock, 1000);
        }

        // 2. Spin 3D Button in Hero
        const spinBtn = document.getElementById('btn-spin-3d');
        if (spinBtn) {
            spinBtn.addEventListener('click', () => {
                if (window.__hero3D) {
                    window.__hero3D.spinRapid();
                    window.__hero3D.pulseCore();
                    toast('3D Cyber Core Accelerated!');
                }
            });
        }
    })();
})();


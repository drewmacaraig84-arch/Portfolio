/**
 * ============================================================================
 * MODERN MINIMALIST 3D HERO AMBIENT CANVAS - DREW MACARAIG
 * Powered by Three.js (Vanilla WebGL, 60fps GPU acceleration)
 * Features:
 *  - 3D Orb/Geometry as the full dynamic background of the #home section
 *  - Full background drag-to-rotate interaction with momentum & inertia
 *  - Interactive 3D Geometry morphing: Crystal Icosahedron, Torus Knot, Gyro Orbiter
 *  - Real-time Material switching: Frosted Glass, Liquid Chrome, Cyber Neon
 *  - Responsive camera & object positioning (desktop offset, mobile centered)
 *  - Ambient particle constellation
 *  - Auto-pauses when off-screen for 100% battery & CPU efficiency
 * ============================================================================
 */

(function () {
    'use strict';

    if (typeof THREE === 'undefined') {
        console.warn('Three.js library not detected.');
        return;
    }

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Attach to hero 3D wrapper or fallback container
    const container = document.getElementById('hero-3d-wrapper') || document.getElementById('hero-3d-canvas-container');
    if (!container) return;

    // Clean any prior canvas
    container.innerHTML = '';

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 21;

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- Main Rotating 3D Group ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Responsive position and scale for hero layout
    function updateGroupPosition() {
        const w = window.innerWidth;
        if (w >= 1024) {
            // Position toward right side of hero behind / alongside content
            mainGroup.position.set(4.6, 0.2, 0);
            mainGroup.scale.set(1.15, 1.15, 1.15);
        } else if (w >= 768) {
            mainGroup.position.set(2.8, 0.4, -1.0);
            mainGroup.scale.set(1.0, 1.0, 1.0);
        } else {
            // Mobile: center orb as subtle ambient backdrop
            mainGroup.position.set(0, 1.5, -4.5);
            mainGroup.scale.set(0.92, 0.92, 0.92);
        }
    }
    updateGroupPosition();

    // --- Materials Palette ---
    const materials = {
        glass: new THREE.MeshPhysicalMaterial({
            color: 0x6366f1,
            emissive: 0x1e1b4b,
            emissiveIntensity: 0.5,
            roughness: 0.15,
            metalness: 0.2,
            transmission: 0.6,
            ior: 1.5,
            transparent: true,
            opacity: 0.88,
            wireframe: false
        }),
        chrome: new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            roughness: 0.08,
            metalness: 0.95,
            wireframe: false
        }),
        neon: new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            emissive: 0x0891b2,
            emissiveIntensity: 1.6,
            roughness: 0.2,
            metalness: 0.7,
            wireframe: true
        })
    };

    let currentMaterialKey = 'glass';

    // --- 1. Shape: Crystal Icosahedron ---
    const crystalGeom = new THREE.IcosahedronGeometry(4.6, 0);
    const crystalMesh = new THREE.Mesh(crystalGeom, materials.glass);
    mainGroup.add(crystalMesh);

    // Inner facets for crystal
    const innerCrystalGeom = new THREE.IcosahedronGeometry(3.2, 1);
    const innerCrystalMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        wireframe: true,
        transparent: true,
        opacity: 0.45
    });
    const innerCrystalMesh = new THREE.Mesh(innerCrystalGeom, innerCrystalMat);
    crystalMesh.add(innerCrystalMesh);

    // --- 2. Shape: Torus Knot ---
    const torusGeom = new THREE.TorusKnotGeometry(3.4, 0.95, 128, 24);
    const torusMesh = new THREE.Mesh(torusGeom, materials.glass);
    torusMesh.visible = false;
    mainGroup.add(torusMesh);

    // --- 3. Shape: Gyro Orbiter Group ---
    const gyroGroup = new THREE.Group();
    gyroGroup.visible = false;
    mainGroup.add(gyroGroup);

    const coreGeom = new THREE.SphereGeometry(1.6, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.2,
        roughness: 0.1,
        metalness: 0.9
    });
    const gyroCore = new THREE.Mesh(coreGeom, coreMat);
    gyroGroup.add(gyroCore);

    const ring1Geom = new THREE.TorusGeometry(5.2, 0.12, 16, 80);
    const ring1Mat = new THREE.MeshStandardMaterial({ color: 0x818cf8, metalness: 0.85, roughness: 0.2 });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    gyroGroup.add(ring1);

    const ring2Geom = new THREE.TorusGeometry(6.4, 0.09, 16, 90);
    const ring2Mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.9, roughness: 0.15 });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    gyroGroup.add(ring2);

    const shapes = {
        crystal: crystalMesh,
        torus: torusMesh,
        gyro: gyroGroup
    };

    let currentShapeKey = 'crystal';

    // --- Ambient Particle Dust ---
    const particleCount = prefersReducedMotion ? 100 : 320;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorA = new THREE.Color(0x6366f1);
    const colorB = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 55;
        positions[i3 + 1] = (Math.random() - 0.5) * 45;
        positions[i3 + 2] = (Math.random() - 0.5) * 40;

        const mixed = Math.random() < 0.5 ? colorA : colorB;
        colors[i3] = mixed.r;
        colors[i3 + 1] = mixed.g;
        colors[i3 + 2] = mixed.b;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 16;
    particleCanvas.height = 16;
    const pCtx = particleCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    pGrad.addColorStop(0, 'rgba(255,255,255,1)');
    pGrad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 16, 16);

    const particleMat = new THREE.PointsMaterial({
        size: 0.55,
        vertexColors: true,
        map: new THREE.CanvasTexture(particleCanvas),
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const lightCyan = new THREE.PointLight(0x00f0ff, 3.2, 45);
    lightCyan.position.set(12, 10, 14);
    scene.add(lightCyan);

    const lightViolet = new THREE.PointLight(0xa855f7, 2.8, 45);
    lightViolet.position.set(-12, -10, 12);
    scene.add(lightViolet);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.25);
    dirLight.position.set(5, 18, 16);
    scene.add(dirLight);

    // --- Drag & Touch Interaction ---
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };
    let isVisible = true;
    let autoRotate = true;

    // Track pointer over window for gentle ambient light parallax
    window.addEventListener('pointermove', function (e) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    // Drag-to-rotate hero background
    const heroSection = document.getElementById('home') || container;

    heroSection.addEventListener('pointerdown', function (e) {
        // If clicking on buttons, links, controls, toolbar, or nav, let standard click work
        if (e.target.closest('a, button, input, select, textarea, .hero-3d-toolbar, .navbar, .nav-actions, .mobile-nav-panel')) {
            return;
        }
        isDragging = true;
        prevMousePos = { x: e.clientX, y: e.clientY };
        dragVelocity = { x: 0, y: 0 };
        document.body.classList.add('is-rotating-3d');
    });

    window.addEventListener('pointermove', function (e) {
        if (!isDragging) return;
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        dragVelocity = { x: deltaX * 0.006, y: deltaY * 0.006 };
        mainGroup.rotation.y += dragVelocity.x;
        mainGroup.rotation.x += dragVelocity.y;
        prevMousePos = { x: e.clientX, y: e.clientY };
    }, { passive: true });

    function stopDragging() {
        if (isDragging) {
            isDragging = false;
            document.body.classList.remove('is-rotating-3d');
        }
    }

    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);

    // Resize Handler
    function handleResize() {
        if (!container) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        updateGroupPosition();
    }
    window.addEventListener('resize', handleResize);

    // Visibility Observer
    if (heroSection && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver(function (entries) {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        obs.observe(heroSection);
    }

    // --- Shape & Material Switching API ---
    function setShape(shapeName) {
        if (!shapes[shapeName]) return;
        currentShapeKey = shapeName;
        Object.entries(shapes).forEach(([name, mesh]) => {
            mesh.visible = (name === shapeName);
        });
        applyMaterial(currentMaterialKey);
    }

    function applyMaterial(matName) {
        if (!materials[matName]) return;
        currentMaterialKey = matName;
        const mat = materials[matName];
        crystalMesh.material = mat;
        torusMesh.material = mat;
        ring1.material = mat;
        ring2.material = mat;
    }

    // Connect Stage UI Buttons if present
    function bindStageControls() {
        document.querySelectorAll('.stage-control-btn[data-geo]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.stage-control-btn[data-geo]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                setShape(btn.dataset.geo);
                if (typeof window.playUIAudio === 'function') window.playUIAudio(680, 0.05);
            });
        });

        document.querySelectorAll('.stage-control-btn[data-mat]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.stage-control-btn[data-mat]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyMaterial(btn.dataset.mat);
                if (typeof window.playUIAudio === 'function') window.playUIAudio(740, 0.05);
            });
        });

        const spinBtn = document.getElementById('btn-spin-3d');
        if (spinBtn) {
            spinBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dragVelocity.x = 0.32;
                dragVelocity.y = 0.14;
                if (typeof window.playUIAudio === 'function') window.playUIAudio(880, 0.08);
                if (window.__hero3D && window.__hero3D.pulseCore) {
                    window.__hero3D.pulseCore();
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindStageControls);
    } else {
        bindStageControls();
    }

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;

        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();

        if (!isDragging) {
            dragVelocity.x *= 0.92;
            dragVelocity.y *= 0.92;
            mainGroup.rotation.y += dragVelocity.x;
            mainGroup.rotation.x += dragVelocity.y;
        }

        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        if (!prefersReducedMotion && autoRotate) {
            mainGroup.rotation.y += 0.004;
            mainGroup.rotation.x += 0.0015;

            if (currentShapeKey === 'gyro') {
                ring1.rotation.z += 0.01;
                ring2.rotation.z -= 0.008;
                const scale = 1 + Math.sin(elapsedTime * 2.5) * 0.06;
                gyroCore.scale.set(scale, scale, scale);
            }

            particles.rotation.y = elapsedTime * 0.02;

            lightCyan.position.x = 12 + targetX * 14;
            lightCyan.position.y = 10 + targetY * 10;
            lightViolet.position.x = -12 + targetX * -12;
            lightViolet.position.y = -10 + targetY * -8;
        }

        renderer.render(scene, camera);
    }

    animate();

    // Global Public Controller
    window.__hero3D = {
        setShape: setShape,
        setMaterial: applyMaterial,
        spinRapid: function () { dragVelocity.x = 0.32; dragVelocity.y = 0.14; },
        pulseCore: function () {
            mainGroup.scale.set(1.18, 1.18, 1.18);
            setTimeout(() => { updateGroupPosition(); }, 350);
        },
        toggleAutoRotate: function () { autoRotate = !autoRotate; return autoRotate; },
        resize: handleResize
    };
})();

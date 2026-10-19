/**
 * ============================================================================
 * 3D WEBGL HERO EXPERIENCE - DREW MACARAIG PORTFOLIO
 * Powered by Three.js (Vanilla WebGL, 60fps GPU acceleration, Zero Lag)
 * Features:
 *  - Interactive 3D Holographic Cyber Core (Nested Polyhedron + Gyroscopic Rings)
 *  - Interactive 3D Particle Constellation / Starfield
 *  - Dynamic Dual Point Lights following cursor in 3D space
 *  - Mouse drag-to-spin with physics inertia
 *  - Scroll-triggered camera parallax
 *  - Battery & Performance Aware: Auto-pauses when scrolled out of view
 *  - Accessible: Respects prefers-reduced-motion
 * ============================================================================
 */

(function () {
    'use strict';

    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not found. 3D canvas disabled.');
        return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const container = document.getElementById('hero-3d-wrapper');
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    
    // Transparent background so existing sleek gradients shine through
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- 3D Objects Group ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Inner Glowing Polyhedron (Icosahedron)
    const innerGeom = new THREE.IcosahedronGeometry(4.2, 1);
    const innerMat = new THREE.MeshPhysicalMaterial({
        color: 0x4f46e5,
        emissive: 0x1e1b4b,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.85,
        wireframe: true,
        transparent: true,
        opacity: 0.75
    });
    const innerMesh = new THREE.Mesh(innerGeom, innerMat);
    mainGroup.add(innerMesh);

    // 2. Central Glowing Core (Solid miniature sphere)
    const coreGeom = new THREE.SphereGeometry(1.4, 24, 24);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.5,
        roughness: 0.1,
        metalness: 0.9
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    mainGroup.add(coreMesh);

    // 3. Orbiting Gyro Ring 1 (Torus)
    const ring1Geom = new THREE.TorusGeometry(6.6, 0.08, 16, 80);
    const ring1Mat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x6d28d9,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.9
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    // 4. Orbiting Gyro Ring 2 (Torus)
    const ring2Geom = new THREE.TorusGeometry(7.6, 0.06, 16, 90);
    const ring2Mat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0284c7,
        emissiveIntensity: 0.7,
        roughness: 0.3,
        metalness: 0.95
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    mainGroup.add(ring2);

    // 5. Orbiting Data Nodes on the rings
    const nodesGroup = new THREE.Group();
    const nodeGeom = new THREE.OctahedronGeometry(0.35);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    
    for (let i = 0; i < 6; i++) {
        const node = new THREE.Mesh(nodeGeom, nodeMat);
        const angle = (i / 6) * Math.PI * 2;
        node.position.x = Math.cos(angle) * 6.6;
        node.position.y = Math.sin(angle) * 6.6;
        nodesGroup.add(node);
    }
    ring1.add(nodesGroup);

    // 6. 3D Ambient Particle Constellation (800 stars)
    const particleCount = prefersReducedMotion ? 200 : 750;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x6366f1); // Indigo
    const c2 = new THREE.Color(0x06b6d4); // Cyan
    const c3 = new THREE.Color(0xa855f7); // Violet

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 60;
        positions[i3 + 1] = (Math.random() - 0.5) * 45;
        positions[i3 + 2] = (Math.random() - 0.5) * 45;

        const mixed = Math.random() < 0.4 ? c1 : (Math.random() < 0.5 ? c2 : c3);
        colors[i3] = mixed.r;
        colors[i3 + 1] = mixed.g;
        colors[i3 + 2] = mixed.b;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom circular soft particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const particleTex = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
        size: 0.65,
        vertexColors: true,
        map: particleTex,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x0a0f2d, 1.2);
    scene.add(ambientLight);

    // Interactive point light 1 (Cyan) following mouse
    const lightCyan = new THREE.PointLight(0x00f0ff, 3.5, 45);
    lightCyan.position.set(10, 10, 15);
    scene.add(lightCyan);

    // Interactive point light 2 (Violet / Indigo)
    const lightViolet = new THREE.PointLight(0xa855f7, 3.0, 45);
    lightViolet.position.set(-10, -10, 12);
    scene.add(lightViolet);

    // Subtle directional light for metallic sheen
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 20, 20);
    scene.add(dirLight);

    // --- Interaction Physics & State ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };
    let isVisible = true;

    // Window mouse move listener
    window.addEventListener('pointermove', function (e) {
        // Normalized coordinates (-1 to 1)
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    // Drag to spin interaction on container
    container.addEventListener('pointerdown', function (e) {
        isDragging = true;
        prevMousePos = { x: e.clientX, y: e.clientY };
        dragVelocity = { x: 0, y: 0 };
        container.style.cursor = 'grabbing';
    });

    window.addEventListener('pointermove', function (e) {
        if (!isDragging) return;
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        dragVelocity = { x: deltaX * 0.005, y: deltaY * 0.005 };
        mainGroup.rotation.y += dragVelocity.x;
        mainGroup.rotation.x += dragVelocity.y;
        prevMousePos = { x: e.clientX, y: e.clientY };
    }, { passive: true });

    window.addEventListener('pointerup', function () {
        if (isDragging) {
            isDragging = false;
            container.style.cursor = 'grab';
        }
    });

    // Resize Handler
    function onResize() {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    // Intersection Observer to stop render loop when hero is off-screen
    const heroSection = document.getElementById('home');
    if (heroSection && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver(function (entries) {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        obs.observe(heroSection);
    }

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        // Pause loop if off-screen to preserve 100% device battery & performance
        if (!isVisible) return;

        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();

        // Inertia damping after drag
        if (!isDragging) {
            dragVelocity.x *= 0.94;
            dragVelocity.y *= 0.94;
            mainGroup.rotation.y += dragVelocity.x;
            mainGroup.rotation.x += dragVelocity.y;
        }

        // Smooth mouse lerping
        targetX += (mouseX - targetX) * 0.04;
        targetY += (mouseY - targetY) * 0.04;

        if (!prefersReducedMotion) {
            // Gentle continuous 3D rotation
            innerMesh.rotation.y += 0.003;
            innerMesh.rotation.x += 0.002;
            
            ring1.rotation.z += 0.007;
            ring2.rotation.z -= 0.005;
            ring2.rotation.y += 0.003;

            // Core pulsation
            const scale = 1 + Math.sin(elapsedTime * 2.2) * 0.08;
            coreMesh.scale.set(scale, scale, scale);

            // Subtle particle drift
            particles.rotation.y = elapsedTime * 0.015;
            particles.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05;

            // Light position shifts matching cursor
            lightCyan.position.x = 10 + targetX * 18;
            lightCyan.position.y = 8 + targetY * 14;
            lightViolet.position.x = -10 + targetX * -15;
            lightViolet.position.y = -8 + targetY * -12;

            // Parallax tilt on main group
            mainGroup.rotation.y += (targetX * 0.45 - (mainGroup.rotation.y % (Math.PI * 2))) * 0.03;
            mainGroup.rotation.x += (-targetY * 0.35 - (mainGroup.rotation.x % (Math.PI * 2))) * 0.03;
        }

        renderer.render(scene, camera);
    }

    animate();

    // Expose 3D controller for easter eggs or manual trigger
    window.__hero3D = {
        pulseCore: function () {
            coreMat.emissiveIntensity = 4.0;
            setTimeout(() => { coreMat.emissiveIntensity = 1.5; }, 400);
        },
        spinRapid: function () {
            dragVelocity.x = 0.25;
        }
    };
})();

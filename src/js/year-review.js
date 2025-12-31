/* -------------------------------------------------------------------------- */
/* LIGHT RAYS EFFECT (OGL) - NAPRAWIONA FUNKCJA                               */
/* -------------------------------------------------------------------------- */
function initLightRays(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.ogl) {
        console.warn("LightRays: Container or OGL not found");
        return;
    }

    const { Renderer, Program, Triangle, Mesh } = window.ogl;

    const config = {
        raysOrigin: 'top-center',
        raysColor: '#06b6d4',
        raysSpeed: 0.5,
        lightSpread: 0.2,
        rayLength: 1.0,
        pulsating: true,
        fadeDistance: 1.0,
        saturation: 1.0,
        followMouse: true,
        mouseInfluence: 0.05,
        noiseAmount: 0.05,
        distortion: 0.0
    };

    const hexToRgb = hex => {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
    };

    const getAnchorAndDir = (origin, w, h) => {
        const outside = 0.2;
        switch (origin) {
            case 'top-left': return { anchor: [0, -outside * h], dir: [0, 1] };
            case 'top-right': return { anchor: [w, -outside * h], dir: [0, 1] };
            case 'bottom-left': return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
            case 'bottom-right': return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
            default: return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
        }
    };

    const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: true
    });
    const gl = renderer.gl;
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';

    container.innerHTML = '';
    container.appendChild(gl.canvas);

    const vert = `
                attribute vec2 position;
                varying vec2 vUv;
                void main() {
                    vUv = position * 0.5 + 0.5;
                    gl_Position = vec4(position, 0.0, 1.0);
                }
            `;

    const frag = `precision highp float;
                uniform float iTime;
                uniform vec2 iResolution;
                uniform vec2 rayPos;
                uniform vec2 rayDir;
                uniform vec3 raysColor;
                uniform float raysSpeed;
                uniform float lightSpread;
                uniform float rayLength;
                uniform float pulsating;
                uniform float fadeDistance;
                uniform float saturation;
                uniform vec2 mousePos;
                uniform float mouseInfluence;
                uniform float noiseAmount;
                uniform float distortion;

                varying vec2 vUv;

                float noise(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }

                float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
                    vec2 sourceToCoord = coord - raySource;
                    vec2 dirNorm = normalize(sourceToCoord);
                    float cosAngle = dot(dirNorm, rayRefDirection);
                    float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
                    float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
                    float distance = length(sourceToCoord);
                    float maxDistance = iResolution.x * rayLength;
                    float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
                    float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
                    float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;
                    float baseStrength = clamp((0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) + (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)), 0.0, 1.0);
                    return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
                }

                void mainImage(out vec4 fragColor, in vec2 fragCoord) {
                    vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
                    vec2 finalRayDir = rayDir;
                    if (mouseInfluence > 0.0) {
                        vec2 mouseScreenPos = mousePos * iResolution.xy;
                        vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
                        finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
                    }
                    float r1 = rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
                    float r2 = rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);
                    
                    vec3 col = vec3(1.0) * (r1 * 0.5 + r2 * 0.4);

                    if (noiseAmount > 0.0) {
                        float n = noise(coord * 0.01 + iTime * 0.1);
                        col *= (1.0 - noiseAmount + noiseAmount * n);
                    }
                    float brightness = 1.0 - (coord.y / iResolution.y);
                    col *= vec3(0.1 + brightness * 0.8, 0.3 + brightness * 0.6, 0.5 + brightness * 0.5);
                    
                    if (saturation != 1.0) {
                        float gray = dot(col, vec3(0.299, 0.587, 0.114));
                        col = mix(vec3(gray), col, saturation);
                    }
                    col *= raysColor;
                    fragColor = vec4(col, 1.0);
                }

                void main() {
                    mainImage(gl_FragColor, gl_FragCoord.xy);
                }
            `;

    const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [0, 0] },
        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },
        raysColor: { value: hexToRgb(config.raysColor) },
        raysSpeed: { value: config.raysSpeed },
        lightSpread: { value: config.lightSpread },
        rayLength: { value: config.rayLength },
        pulsating: { value: config.pulsating ? 1.0 : 0.0 },
        fadeDistance: { value: config.fadeDistance },
        saturation: { value: config.saturation },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: config.mouseInfluence },
        noiseAmount: { value: config.noiseAmount },
        distortion: { value: config.distortion }
    };

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
        vertex: vert,
        fragment: frag,
        uniforms,
        transparent: true
    });
    const mesh = new Mesh(gl, { geometry, program });

    const mouse = { x: 0.5, y: 0.5 };
    const smoothMouse = { x: 0.5, y: 0.5 };

    function updateSize() {
        renderer.dpr = Math.min(window.devicePixelRatio, 2);
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        uniforms.iResolution.value = [width * renderer.dpr, height * renderer.dpr];
        const { anchor, dir } = getAnchorAndDir(config.raysOrigin, width * renderer.dpr, height * renderer.dpr);
        uniforms.rayPos.value = anchor;
        uniforms.rayDir.value = dir;
    }

    window.addEventListener('resize', updateSize);
    updateSize();

    if (config.followMouse) {
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX / window.innerWidth;
            mouse.y = e.clientY / window.innerHeight;
        });
    }

    function update(t) {
        requestAnimationFrame(update);
        uniforms.iTime.value = t * 0.001;
        if (config.followMouse && config.mouseInfluence > 0) {
            const smoothing = 0.92;
            smoothMouse.x = smoothMouse.x * smoothing + mouse.x * (1 - smoothing);
            smoothMouse.y = smoothMouse.y * smoothing + mouse.y * (1 - smoothing);
            uniforms.mousePos.value = [smoothMouse.x, smoothMouse.y];
        }
        renderer.render({ scene: mesh });
    }
    requestAnimationFrame(update);
}

/* -------------------------------------------------------------------------- */
/* DATA AND LOGIC                                                             */
/* -------------------------------------------------------------------------- */

// Sample events data
// Events data will be loaded from i18n
let events = [];

function updateEventsFromLocale() {
    if (window.i18next && window.i18next.isInitialized) {
        const fetchedEvents = window.i18next.t('recap.events', { returnObjects: true });
        if (Array.isArray(fetchedEvents)) {
            events = fetchedEvents;
            // Update progress if visible
            const progressDisplay = document.getElementById('progress-display');
            if (progressDisplay && events.length > 0) {
                progressDisplay.innerText = `${String(currentIndex + 1).padStart(2, '0')} / ${String(events.length).padStart(2, '0')}`;
            }
        }
    }
}

// Hook into i18n events
function initI18nEvents() {
    if (window.i18next && window.i18next.isInitialized) {
        window.i18next.on('languageChanged', (lng) => {
            updateEventsFromLocale();

            // Update Glitch Text Data Attribute
            const title = document.querySelector('.glitch');
            if (title) {
                title.setAttribute('data-text', window.i18next.t('recap.log_title'));
            }

            // Re-render card if HUD is visible
            if (!document.getElementById('hud-container').classList.contains('hidden')) {
                showCard(currentIndex);
            }

            // Re-render timeline if visible and we are in the summary view
            if (!document.getElementById('timeline-container').classList.contains('hidden')) {
                const container = document.getElementById('timeline-content');
                if (container) {
                    container.innerHTML = '';
                    events.forEach((ev, idx) => {
                        const isLeft = idx % 2 === 0;
                        const item = document.createElement('div');
                        item.className = `relative flex items-center justify-between min-h-[200px] mb-12 group`;

                        const contentHtml = `
                            <div class="glass-hud p-8 rounded-2xl relative transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] group-hover:border-cyan-500/40">
                                 <div class="hidden md:block absolute top-1/2 ${isLeft ? '-right-12' : '-left-12'} w-12 h-0.5 bg-cyan-500/30 transform -translate-y-1/2"></div>
                                 <div class="hidden md:block absolute top-1/2 ${isLeft ? '-right-1' : '-left-1'} w-3 h-3 bg-cyan-500/50 transform -translate-y-1/2 rotate-45"></div>
                                <div class="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
                                    <span class="font-mono-tech text-cyan-400 text-lg font-bold tracking-wider">${ev.date}</span>
                                    <div class="h-px flex-grow bg-gradient-to-r from-cyan-500/20 to-transparent"></div>
                                </div>
                                <h3 class="font-bold text-white text-3xl font-tech mb-3 text-shadow-sm">${ev.title}</h3>
                                <p class="text-gray-300 text-base leading-relaxed">${ev.desc}</p>
                            </div>
                        `;
                        const imageHtml = `
                            <div class="hidden md:flex flex-col items-center justify-center h-full w-full opacity-60 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-110 transition-transform">
                                <div class="w-28 h-28 rounded-full bg-black/40 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md">
                                    <i class="fas ${ev.icon} text-5xl text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"></i>
                                </div>
                            </div>
                        `;

                        if (isLeft) {
                            item.innerHTML = `<div class="w-full pl-12 md:pl-0 md:w-[45%] md:pr-16 md:text-right">${contentHtml}</div>
                                              <div class="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-6 h-6 bg-[#020617] rounded-full border-2 border-cyan-400 z-10 box-border flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,1)] group-hover:scale-125 transition-transform duration-300"><div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div></div>
                                              <div class="hidden md:block md:w-[45%] md:pl-16">${imageHtml}</div>`;
                        } else {
                            item.innerHTML = `<div class="hidden md:block md:w-[45%] md:pr-16">${imageHtml}</div>
                                              <div class="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-6 h-6 bg-[#020617] rounded-full border-2 border-cyan-400 z-10 box-border flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,1)] group-hover:scale-125 transition-transform duration-300"><div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div></div>
                                              <div class="w-full pl-12 md:pl-0 md:w-[45%] md:pl-16 text-left">${contentHtml}</div>`;
                        }
                        container.appendChild(item);
                    });
                }
            }
        });
        updateEventsFromLocale();
    } else {
        setTimeout(initI18nEvents, 100);
    }
}
initI18nEvents();

// Initial try
updateEventsFromLocale();

/* CANVAS WARP ENGINE (Star Field) */
const canvas = document.getElementById('warp-canvas');
const ctx = canvas.getContext('2d');
let width, height, cx, cy;
let stars = [];
const numStars = 2000;
const baseSpeed = 1;
const heavyWarpSpeed = 80;
const lightWarpSpeed = 15;
let targetSpeed = baseSpeed;
let currentSpeed = baseSpeed;

class Star {
    constructor() { this.reset(true); }
    reset(randomZ = false) {
        this.x = (Math.random() - 0.5) * width * 2;
        this.y = (Math.random() - 0.5) * height * 2;
        this.z = randomZ ? Math.random() * 1000 : 1000;
    }
    update() {
        this.z -= currentSpeed;
        if (this.z <= 1) { this.reset(); this.z = 1000; }
    }
    draw() {
        const sx = cx + (this.x / this.z) * 500;
        const sy = cy + (this.y / this.z) * 500;
        const spz = this.z + (currentSpeed / 2);
        const px = cx + (this.x / spz) * 500;
        const py = cy + (this.y / spz) * 500;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        const alpha = (1000 - this.z) / 1000;
        if (currentSpeed > 20) {
            ctx.strokeStyle = `rgba(100, 220, 255, ${alpha})`;
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 1.5;
        }
        ctx.stroke();
    }
}

function initCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    cx = width / 2;
    cy = height / 2;
    canvas.width = width;
    canvas.height = height;
    stars = [];
    for (let i = 0; i < numStars; i++) stars.push(new Star());
}

function animate() {
    ctx.fillStyle = "rgba(2, 6, 23, 1)";
    ctx.fillRect(0, 0, width, height);
    currentSpeed += (targetSpeed - currentSpeed) * 0.05;
    stars.forEach(star => { star.update(); star.draw(); });
    requestAnimationFrame(animate);
}

window.addEventListener('resize', initCanvas);
initCanvas();
animate();

/* APP LOGIC */
let currentIndex = 0;
const introScreen = document.getElementById('intro-screen');
const hudContainer = document.getElementById('hud-container');
const eventCard = document.getElementById('event-card');
const timelineContainer = document.getElementById('timeline-container');
const outroScreen = document.getElementById('outro-screen');
const velocityDisplay = document.getElementById('velocity-display');
const progressDisplay = document.getElementById('progress-display');
let isTransitioning = false;

function startSequence() {
    introScreen.classList.add('fade-out');
    const lightRays = document.getElementById('light-rays-container');
    if (lightRays) {
        lightRays.style.opacity = '0';
        setTimeout(() => lightRays.remove(), 1000); // Remove after fade out
    }
    targetSpeed = heavyWarpSpeed;
    setTimeout(() => {
        introScreen.classList.add('hidden');
        progressDisplay.innerText = `01 / ${String(events.length).padStart(2, '0')}`;
        setTimeout(() => {
            targetSpeed = baseSpeed;
            hudContainer.classList.remove('hidden');
            hudContainer.classList.add('flex');
            velocityDisplay.innerText = "STABLE";
            velocityDisplay.className = "text-cyan-500";
            setTimeout(() => showCard(0), 100);
        }, 2000);
    }, 500);
}

function showCard(index) {
    const ev = events[index];
    document.getElementById('card-date').innerText = ev.date;
    document.getElementById('card-title').innerText = ev.title;
    document.getElementById('card-desc').innerText = ev.desc;
    document.getElementById('card-icon').className = `fas ${ev.icon} text-4xl text-cyan-400`;
    progressDisplay.innerText = `${String(index + 1).padStart(2, '0')} / ${String(events.length).padStart(2, '0')}`;
    eventCard.style.opacity = '1';
    eventCard.style.transform = 'scale(1)';
}

function nextEvent() {
    if (isTransitioning) return;
    isTransitioning = true;

    eventCard.style.opacity = '0';
    eventCard.style.transform = 'scale(0.9)';
    setTimeout(() => {
        if (currentIndex < events.length - 1) {
            targetSpeed = lightWarpSpeed;
            velocityDisplay.innerText = "ACCELERATING";
            velocityDisplay.className = "text-yellow-400";
            setTimeout(() => {
                currentIndex++;
                targetSpeed = baseSpeed;
                velocityDisplay.innerText = "STABLE";
                velocityDisplay.className = "text-cyan-500";
                showCard(currentIndex);
                isTransitioning = false;
            }, 800);
        } else {
            showOutroSequence();
            // No need to reset isTransitioning here as we move to outro
        }
    }, 200);
}

function showOutroSequence() {
    hudContainer.classList.add('hidden');
    hudContainer.classList.remove('flex');
    outroScreen.classList.remove('hidden');
    outroScreen.classList.add('flex');
    setTimeout(() => {
        document.getElementById('outro-logo').classList.remove('scale-50', 'opacity-0');
        document.getElementById('outro-text').classList.remove('translate-y-10', 'opacity-0');
        setTimeout(() => {
            outroScreen.classList.add('fade-out');
            setTimeout(() => {
                outroScreen.classList.add('hidden');
                engageHyperWarpExit();
            }, 500);
        }, 3000);
    }, 100);
}

function engageHyperWarpExit() {
    targetSpeed = 200; // Super Warp
    setTimeout(() => {
        const overlay = document.getElementById('transition-overlay');
        overlay.classList.remove('duration-1000');
        overlay.classList.add('duration-200');
        overlay.style.opacity = '1';
        setTimeout(() => {
            showTimeline();
            setTimeout(() => {
                overlay.classList.remove('duration-200');
                overlay.classList.add('duration-[2000ms]');
                overlay.style.opacity = '0';
            }, 100);
        }, 250);
    }, 1200);
}

function showTimeline() {
    canvas.style.display = 'none'; // Hide star canvas
    timelineContainer.classList.remove('hidden');
    window.scrollTo(0, 0);
    document.documentElement.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden');
    document.body.style.overflowY = 'auto';

    // Initialize Light Rays NOW - REMOVED from here, moved to load
    // initLightRays('light-rays-container');

    // Initialize SplashCursor Effect safely
    try {
        if (window.initSplashCursor) {
            window.initSplashCursor();
        } else {
            console.warn("SplashCursor init function not found");
        }
    } catch (e) {
        console.error("Failed to initialize SplashCursor:", e);
        const fluidCanvas = document.getElementById('fluid');
        if (fluidCanvas) fluidCanvas.style.display = 'none';
    }

    const container = document.getElementById('timeline-content');
    container.innerHTML = '';
    events.forEach((ev, idx) => {
        const isLeft = idx % 2 === 0;
        const item = document.createElement('div');
        item.className = `relative flex items-center justify-between min-h-[200px] mb-12 group`;

        const contentHtml = `
            <div class="glass-hud p-8 rounded-2xl relative transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] group-hover:border-cyan-500/40">
                 <div class="hidden md:block absolute top-1/2 ${isLeft ? '-right-12' : '-left-12'} w-12 h-0.5 bg-cyan-500/30 transform -translate-y-1/2"></div>
                 <div class="hidden md:block absolute top-1/2 ${isLeft ? '-right-1' : '-left-1'} w-3 h-3 bg-cyan-500/50 transform -translate-y-1/2 rotate-45"></div>
                <div class="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
                    <span class="font-mono-tech text-cyan-400 text-lg font-bold tracking-wider">${ev.date}</span>
                    <div class="h-px flex-grow bg-gradient-to-r from-cyan-500/20 to-transparent"></div>
                </div>
                <h3 class="font-bold text-white text-3xl font-tech mb-3 text-shadow-sm">${ev.title}</h3>
                <p class="text-gray-300 text-base leading-relaxed">${ev.desc}</p>
            </div>
        `;
        const imageHtml = `
            <div class="hidden md:flex flex-col items-center justify-center h-full w-full opacity-60 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-110 transition-transform">
                <div class="w-28 h-28 rounded-full bg-black/40 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md">
                    <i class="fas ${ev.icon} text-5xl text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"></i>
                </div>
            </div>
        `;

        if (isLeft) {
            item.innerHTML = `<div class="w-full pl-12 md:pl-0 md:w-[45%] md:pr-16 md:text-right">${contentHtml}</div>
                              <div class="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-6 h-6 bg-[#020617] rounded-full border-2 border-cyan-400 z-10 box-border flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,1)] group-hover:scale-125 transition-transform duration-300"><div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div></div>
                              <div class="hidden md:block md:w-[45%] md:pl-16">${imageHtml}</div>`;
        } else {
            item.innerHTML = `<div class="hidden md:block md:w-[45%] md:pr-16">${imageHtml}</div>
                              <div class="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-6 h-6 bg-[#020617] rounded-full border-2 border-cyan-400 z-10 box-border flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,1)] group-hover:scale-125 transition-transform duration-300"><div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div></div>
                              <div class="w-full pl-12 md:pl-0 md:w-[45%] md:pl-16 text-left">${contentHtml}</div>`;
        }
        container.appendChild(item);
    });
}

// Initialize Light Rays on Load
window.addEventListener('load', () => {
    // Wait for OGL to be ready if needed, or just run if script is loaded
    if (window.ogl) {
        initLightRays('light-rays-container');
    } else {
        window.addEventListener('ogl-ready', () => initLightRays('light-rays-container'));
        // Fallback if event missed
        setTimeout(() => initLightRays('light-rays-container'), 500);
    }
});

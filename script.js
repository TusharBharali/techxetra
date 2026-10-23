document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // 1. INTENSE AUDIO ENGINE (Starts from 13.0s on scroll)
    // -------------------------------------------------------------
    const intenseAudio = document.querySelector("#intenseAudio");
    const audioToggle = document.querySelector("#audioToggle");
    const audioWaves = document.querySelector("#audioWaves");
    const audioLabel = document.querySelector("#audioLabel");
    const audioBanner = document.querySelector("#audioBanner");
    let isAudioPlaying = false;

    function playAudio() {
        if (!intenseAudio || isAudioPlaying) return;
        intenseAudio.volume = 0.85;

        const playPromise = intenseAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isAudioPlaying = true;
                if (audioWaves) audioWaves.classList.add("playing");
                if (audioLabel) audioLabel.textContent = "AUDIO ON";
                if (audioBanner) audioBanner.classList.add("hidden");
            }).catch((err) => {
                console.log("Browser policy blocked audio autoplay:", err.message);
                if (audioBanner) audioBanner.classList.remove("hidden");
            });
        }
    }

    function pauseAudio() {
        if (!intenseAudio) return;
        intenseAudio.pause();
        isAudioPlaying = false;
        if (audioWaves) audioWaves.classList.remove("playing");
        if (audioLabel) audioLabel.textContent = "AUDIO OFF";
    }

    // Toggle button in header
    if (audioToggle) {
        audioToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            if (isAudioPlaying) {
                pauseAudio();
            } else {
                playAudio();
            }
        });
    }

    // Floating audio prompt click
    if (audioBanner) {
        audioBanner.addEventListener("click", (e) => {
            e.stopPropagation();
            playAudio();
        });
    }


    // Single click / tap anywhere on the viewport starts audio
    document.addEventListener("click", () => {
        if (!isAudioPlaying) {
            playAudio();
        }
    });

    // TRIGGER AUDIO ON ANY USER INTERACTION OR SCROLL
    const triggerAudio = () => {
        if (!isAudioPlaying) {
            playAudio();
        }
    };

    ['wheel', 'scroll', 'touchmove', 'touchstart', 'touchend', 'pointerdown', 'keydown'].forEach(evt => {
        window.addEventListener(evt, triggerAudio, { passive: true });
    });

    // -------------------------------------------------------------
    // 2. SMOOTH SCROLL (LENIS 1.1) + GSAP SCROLLTRIGGER
    // -------------------------------------------------------------
    let lenis;
    try {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 2.0,
            infinite: false
        });

        gsap.registerPlugin(ScrollTrigger);

        lenis.on('scroll', (e) => {
            ScrollTrigger.update(e);
            if (!isAudioPlaying) {
                playAudio();
            }
        });

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    } catch (e) {
        console.warn("Lenis initialization fallback to native scroll:", e);
        gsap.registerPlugin(ScrollTrigger);
    }

    // -------------------------------------------------------------
    // 3. ELEMENT REFERENCES & INITIAL STATES
    // -------------------------------------------------------------
    const pinContainer = document.querySelector("#pinContainer");
    const logoTech = document.querySelector("#logoTech");
    const logoEtra = document.querySelector("#logoEtra");
    const logoX = document.querySelector("#logoX");
    const portalGlow = document.querySelector("#portalGlow");
    const northStarSparkle = document.querySelector("#northStarSparkle");

    const year2015 = document.querySelector("#year2015");
    const year2016 = document.querySelector("#year2016");
    const year2017 = document.querySelector("#year2017");
    const year2024 = document.querySelector("#year2024");
    const year2026 = document.querySelector("#year2026");
    const comingSoonWrapper = document.querySelector("#comingSoonWrapper");

    // Exact center aperture coordinates of the metallic X: 50% X, 50% Y
    gsap.set(logoX, {
        transformOrigin: "50% 50%",
        scale: 1,
        opacity: 1
    });

    gsap.set(logoTech, { x: 0, opacity: 1 });
    gsap.set(logoEtra, { x: 0, opacity: 1 });

    gsap.set(portalGlow, {
        scale: 0.2,
        opacity: 0
    });

    if (northStarSparkle) {
        gsap.set(northStarSparkle, {
            scale: 1,
            opacity: 0.8
        });
    }

    // Years initial states: tucked deep inside the aperture of the X
    const years = [year2015, year2016, year2017, year2024];
    years.forEach((yr) => {
        gsap.set(yr, {
            scale: 0.12,
            opacity: 0,
            filter: "blur(12px)"
        });
    });

    // 2026? initial state: hidden, inside portal
    gsap.set(year2026, {
        scale: 0.2,
        opacity: 0,
        filter: "blur(10px)",
        visibility: "visible"
    });

    // COMING SOON initial state: dead center, hidden, visibility: hidden
    gsap.set(comingSoonWrapper, {
        scale: 0.88,
        opacity: 0,
        visibility: "hidden"
    });

    // -------------------------------------------------------------
    // 4. MASTER CHRONOLOGY TIMELINE: ZERO COLLISION GUARANTEE
    // 2015 -> 2016 -> 2017 -> 2024 -> 2026? -> [VOID] -> COMING SOON
    // -------------------------------------------------------------
    let currentScrollProgress = 0;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: pinContainer,
            start: "top top",
            end: "+=4500",       // Generous scroll distance for tactile scrubbing
            pin: true,           // Freeze camera in place
            scrub: 1.0,          // Direct, crisp physical scrubbing
            anticipatePin: 1,
            onUpdate: (self) => {
                currentScrollProgress = self.progress;

                // Hard mutual exclusivity safeguard:
                // Before 0.85 progress, COMING SOON is completely invisible.
                // At 0.85 and above, 2026? is completely invisible.
                if (self.progress < 0.85) {
                    comingSoonWrapper.style.visibility = "hidden";
                    year2026.style.visibility = "visible";
                } else {
                    year2026.style.visibility = "hidden";
                    comingSoonWrapper.style.visibility = "visible";
                }
            }
        }
    });


    // Step B: TECH and ETRA part ways and dissolve outward
    tl.to(logoTech, {
        x: -280,
        opacity: 0,
        duration: 0.18,
        ease: "power2.inOut"
    }, 0.02);

    tl.to(logoEtra, {
        x: 280,
        opacity: 0,
        duration: 0.18,
        ease: "power2.inOut"
    }, 0.02);

    // Step C: The metallic X gets BIGGER and BIGGER!
    tl.to(logoX, {
        scale: 80,
        duration: 0.48,
        ease: "power2.in"
    }, 0.02);

    // North Star Sparkle expands into the dive and fades
    if (northStarSparkle) {
        tl.to(northStarSparkle, {
            scale: 3.5,
            opacity: 0,
            duration: 0.22,
            ease: "power1.in"
        }, 0.04);
    }

    // Giant X expands past screen borders and dissolves
    tl.to(logoX, {
        opacity: 0,
        duration: 0.14,
        ease: "power1.in"
    }, 0.36);

    // Portal flare pulses in the center of the X
    tl.to(portalGlow, {
        scale: 2.8,
        opacity: 0.85,
        duration: 0.20,
        ease: "power2.out"
    }, 0.04);

    tl.to(portalGlow, {
        opacity: 0,
        duration: 0.18,
        ease: "power1.in"
    }, 0.28);

    // -------------------------------------------------------------
    // THE YEARS FLY THROUGH THE X APERTURE (Sequential & Clean)
    // -------------------------------------------------------------

    // 1. YEAR 2015 (Zooms out of the X, reaches screen, and flies past)
    tl.to(year2015, {
        scale: 1.0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.08,
        ease: "power2.out"
    }, 0.08)
    .to(year2015, {
        scale: 2.4,
        opacity: 0,
        filter: "blur(16px)",
        duration: 0.07,
        ease: "power2.in"
    }, 0.16);

    // 2. YEAR 2016 (Emerges, reaches focus, and flies past)
    tl.to(year2016, {
        scale: 1.0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.08,
        ease: "power2.out"
    }, 0.19)
    .to(year2016, {
        scale: 2.4,
        opacity: 0,
        filter: "blur(16px)",
        duration: 0.07,
        ease: "power2.in"
    }, 0.27);

    // 3. YEAR 2017 (Emerges, reaches focus, and flies past)
    tl.to(year2017, {
        scale: 1.0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.08,
        ease: "power2.out"
    }, 0.30)
    .to(year2017, {
        scale: 2.4,
        opacity: 0,
        filter: "blur(16px)",
        duration: 0.07,
        ease: "power2.in"
    }, 0.38);

    // 4. YEAR 2024 (Emerges, reaches focus, and flies past)
    tl.to(year2024, {
        scale: 1.0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.08,
        ease: "power2.out"
    }, 0.41)
    .to(year2024, {
        scale: 2.4,
        opacity: 0,
        filter: "blur(16px)",
        duration: 0.07,
        ease: "power2.in"
    }, 0.49);

    // 5. THE 2026? WITH RED QUESTION MARK: COMMANDING THE SCREEN ALONE!
    // Scales into dead center with glowing red neon luminescence
    tl.to(year2026, {
        scale: 1.0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.12,
        ease: "power2.out"
    }, 0.54);

    // 2026? HOLDS IN CENTER (0.66 to 0.76) - Fully visible, 100% alone!
    
    // As user scrolls further, 2026? zooms forward and dissolves COMPLETELY into the void
    tl.to(year2026, {
        scale: 2.2,
        opacity: 0,
        filter: "blur(20px)",
        duration: 0.08,
        ease: "power2.in"
    }, 0.76);

    // 0.84 -> 0.87: COSMIC VOID BUFFER GAP (neither element visible)

    // 6. AND AFTER 2026? HAS VANISHED: COMING SOON EMERGES IN DEAD CENTER!
    tl.to(comingSoonWrapper, {
        scale: 1.0,
        opacity: 1,
        duration: 0.11,
        ease: "power2.out"
    }, 0.87);

    // Subtle letterSpacing polish at the finale
    tl.to(".title-text", {
        letterSpacing: "0.22em",
        duration: 0.08,
        ease: "power1.out"
    }, 0.92);

    // -------------------------------------------------------------
    // 5. NORTH STAR CIRCUMPOLAR CELESTIAL STARFIELD ENGINE
    // -------------------------------------------------------------
    // 5. NORTH STAR CIRCUMPOLAR CELESTIAL STARFIELD ENGINE
    // The TechXetra logo acts as Polaris (the North Star)
    // -------------------------------------------------------------
    function initNorthStarStarfield() {
        const canvas = document.querySelector("#starfieldCanvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        let width = window.innerWidth;
        let height = window.innerHeight;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        let stars = [];
        const STAR_COUNT = 550;
        let rotationAngle = 0;
        const baseSpeed = 0.00045; // Visible, majestic circumpolar night sky rotation

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
        }

        function createStars() {
            stars = [];
            const maxRadius = Math.sqrt(width * width + height * height) * 0.85;

            for (let i = 0; i < STAR_COUNT; i++) {
                // Dense around the North Star, stretching across the whole universe
                const r = Math.pow(Math.random(), 0.65) * maxRadius + 15;
                const angle = Math.random() * Math.PI * 2;
                
                // Three tiers of stellar brightness
                const randTier = Math.random();
                let size, baseAlpha, isProminent;
                if (randTier < 0.12) {
                    // Major brilliant stars
                    size = Math.random() * 1.6 + 2.4; // 2.4px to 4.0px
                    baseAlpha = Math.random() * 0.2 + 0.8;
                    isProminent = true;
                } else if (randTier < 0.45) {
                    // Medium bright stars
                    size = Math.random() * 0.8 + 1.6; // 1.6px to 2.4px
                    baseAlpha = Math.random() * 0.25 + 0.65;
                    isProminent = false;
                } else {
                    // Crisp ambient stars
                    size = Math.random() * 0.6 + 1.0; // 1.0px to 1.6px
                    baseAlpha = Math.random() * 0.3 + 0.55;
                    isProminent = false;
                }
                
                const twinkleSpeed = Math.random() * 0.035 + 0.015;
                const twinklePhase = Math.random() * Math.PI * 2;

                // Astronomical stellar spectral colors
                const cRand = Math.random();
                let color;
                if (cRand < 0.55) {
                    color = "255, 255, 255";       // Pure diamond white
                } else if (cRand < 0.78) {
                    color = "180, 225, 255";       // Electric sapphire blue
                } else if (cRand < 0.92) {
                    color = "255, 242, 205";       // Warm stellar gold
                } else {
                    color = "255, 60, 80";         // Glowing TechXetra red spark
                }

                // Circumpolar orbital arc trails
                const hasTrail = (isProminent || Math.random() < 0.28) && r > 60;
                const trailAngle = hasTrail ? (Math.random() * 0.04 + 0.018) : 0;

                stars.push({
                    r,
                    angle,
                    size,
                    baseAlpha,
                    twinkleSpeed,
                    twinklePhase,
                    color,
                    hasTrail,
                    trailAngle
                });
            }
        }

        function getNorthStarCenter() {
            const stage = document.querySelector("#stage");
            if (stage) {
                const rect = stage.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    return {
                        x: rect.left + rect.width * 0.5,
                        y: rect.top + rect.height * 0.5
                    };
                }
            }
            return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
        }

        resize();
        createStars();

        window.addEventListener("resize", () => {
            resize();
            createStars();
        });

        let lastTime = performance.now();

        function render(now) {
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            // Safe DPR clear
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.scale(dpr, dpr);

            const center = getNorthStarCenter();

            // When user scrubs down, rotation accelerates subtly
            const speedBoost = currentScrollProgress * 0.003;
            const effectiveSpeed = baseSpeed + speedBoost;
            rotationAngle += effectiveSpeed * (dt * 60);

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                s.twinklePhase += s.twinkleSpeed;
                const twinkle = Math.sin(s.twinklePhase) * 0.18;

                let alpha = Math.max(0.3, Math.min(1, s.baseAlpha + twinkle));
                if (currentScrollProgress > 0.45) {
                    const textDim = Math.max(0.2, 1 - (currentScrollProgress - 0.45) * 1.4);
                    alpha *= textDim;
                }

                // Current circumpolar orbital angle around the North Star
                const currentAngle = s.angle + rotationAngle;

                // Radial warp during deep scroll
                const warpOffset = currentScrollProgress * (s.r * 1.1);
                const r = s.r + warpOffset;

                const x = center.x + Math.cos(currentAngle) * r;
                const y = center.y + Math.sin(currentAngle) * r;

                // Screen boundary culling
                if (x < -80 || x > width + 80 || y < -80 || y > height + 80) continue;

                // 1. Draw Circumpolar Star Trails (Long exposure night sky effect)
                if (s.hasTrail && currentScrollProgress < 0.35) {
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, r, currentAngle - s.trailAngle, currentAngle, false);
                    ctx.strokeStyle = `rgba(${s.color}, ${alpha * 0.45})`;
                    ctx.lineWidth = s.size * 0.85;
                    ctx.lineCap = "round";
                    ctx.stroke();
                }

                // 2. Draw Star Core & Glow
                ctx.beginPath();
                ctx.arc(x, y, s.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${s.color}, ${alpha})`;

                if (s.size > 2.0) {
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = `rgba(${s.color}, 0.95)`;
                } else {
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = `rgba(${s.color}, 0.6)`;
                }
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            ctx.restore();

            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    }

    // Launch North Star Starfield
    initNorthStarStarfield();

    // -------------------------------------------------------------
    // 6. DESKTOP MOUSE PARALLAX
    // -------------------------------------------------------------
    const stage = document.querySelector("#stage");
    window.addEventListener("mousemove", (e) => {
        if (window.scrollY < 200) {
            const { clientX, clientY } = e;
            const xPos = (clientX / window.innerWidth - 0.5) * 16;
            const yPos = (clientY / window.innerHeight - 0.5) * 16;
            gsap.to(stage, {
                x: xPos,
                y: yPos,
                duration: 1.0,
                ease: "power1.out"
            });
        }
    });

    // -------------------------------------------------------------
    // 7. RESPONSIVE REFRESH
    // -------------------------------------------------------------
    window.addEventListener("resize", () => {
        ScrollTrigger.refresh();
    });

    // -------------------------------------------------------------
    // 8. COUNTDOWN TIMER ENGINE: TARGET 26 OCT 12:00 AM
    // -------------------------------------------------------------
    function initCountdownTimer() {
        const daysEl = document.querySelector("#timerDays");
        const hoursEl = document.querySelector("#timerHours");
        const minsEl = document.querySelector("#timerMinutes");
        const secsEl = document.querySelector("#timerSeconds");

        if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

        // Target: 26 Oct 12:00 AM (Midnight, 00:00:00)
        function getTargetTimestamp() {
            const now = new Date();
            let targetYear = 2026;
            if (now.getFullYear() > 2026) {
                targetYear = now.getFullYear();
            }
            // Month 9 is October (0-indexed: 0=Jan ... 9=Oct)
            const target = new Date(targetYear, 9, 26, 0, 0, 0, 0);
            return target.getTime();
        }

        const targetTime = getTargetTimestamp();

        function padZero(num) {
            return num < 10 ? "0" + num : num.toString();
        }

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetTime - now;

            if (distance <= 0) {
                daysEl.textContent = "00";
                hoursEl.textContent = "00";
                minsEl.textContent = "00";
                secsEl.textContent = "00";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysEl.textContent = padZero(days);
            hoursEl.textContent = padZero(hours);
            minsEl.textContent = padZero(minutes);
            secsEl.textContent = padZero(seconds);
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    initCountdownTimer();
});

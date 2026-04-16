/* ============================================================
   LIDMEED — Interactive Scripts
   Particles, Scroll Animations, Form Handling, Navigation
   Supabase Integration for Lead Capture
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ========================================
       0. SUPABASE CLIENT INIT
       ======================================== */
    const SUPABASE_URL = 'https://xxeaxqthkkoorrszceyy.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWF4cXRoa2tvb3Jyc3pjZXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzk3NDIsImV4cCI6MjA5MTg1NTc0Mn0.w8j1wiI8IysXIk0h516I3_YhHX2GlSEUN-xesAD50hI';

    let supabaseClient = null;

    function getSupabase() {
        if (!supabaseClient && window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        return supabaseClient;
    }

    /* ========================================
       1. PARTICLE CANVAS (HERO)
       ======================================== */
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null };
        let animationId;
        let w, h;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.parentElement.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function createParticles() {
            particles = [];
            if (prefersReducedMotion) return;
            
            const count = Math.min(Math.floor((w * h) / 12000), 80);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.4 + 0.1,
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, w, h);
            
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Movement
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        const lineOpacity = (1 - dist / 120) * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(0, 212, 255, ${lineOpacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                // Mouse interaction
                if (mouse.x !== null) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const force = (150 - dist) / 150;
                        p.vx += (dx / dist) * force * 0.02;
                        p.vy += (dy / dist) * force * 0.02;
                    }
                }

                // Damping
                p.vx *= 0.998;
                p.vy *= 0.998;
            }

            animationId = requestAnimationFrame(drawParticles);
        }

        // Mouse tracking (hero only)
        canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = canvas.parentElement.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.parentElement.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Init
        resizeCanvas();
        createParticles();
        if (!prefersReducedMotion) {
            drawParticles();
        }

        // Debounced resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                cancelAnimationFrame(animationId);
                resizeCanvas();
                createParticles();
                if (!prefersReducedMotion) drawParticles();
            }, 200);
        });
    }

    /* ========================================
       2. NAVBAR SCROLL EFFECT
       ======================================== */
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    function handleNavScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });

    /* ========================================
       3. MOBILE NAVIGATION
       ======================================== */
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close on link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    /* ========================================
       4. SCROLL ANIMATIONS (INTERSECTION OBSERVER)
       ======================================== */
    const animatedElements = document.querySelectorAll('[data-animate]');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        animatedElements.forEach(el => el.classList.add('visible'));
    }

    /* ========================================
       5. SMOOTH SCROLL FOR ANCHOR LINKS
       ======================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ========================================
       6. FORM HANDLING — SUPABASE INTEGRATION
       ======================================== */
    const form = document.getElementById('lead-form');
    const formSuccess = document.getElementById('form-success');
    const submitBtn = document.getElementById('form-submit');

    if (form) {
        // Phone mask (Brazilian format)
        const phoneInput = document.getElementById('form-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.substring(0, 11);
                
                if (value.length > 6) {
                    value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
                } else if (value.length > 2) {
                    value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
                } else if (value.length > 0) {
                    value = `(${value}`;
                }
                e.target.value = value;
            });
        }

        // Clear error on input focus
        form.querySelectorAll('.form-input, .form-select').forEach(input => {
            input.addEventListener('focus', () => {
                input.classList.remove('error');
                const errorEl = input.parentElement.querySelector('.form-error');
                if (errorEl) errorEl.classList.remove('visible');
            });
        });

        // Form validation + submission to Supabase
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate
            let isValid = true;
            const name = document.getElementById('form-name');
            const email = document.getElementById('form-email');
            const phone = document.getElementById('form-phone');
            const goal = document.getElementById('form-goal');

            // Remove existing errors
            form.querySelectorAll('.form-error').forEach(el => el.remove());
            form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

            function showError(input, message) {
                input.classList.add('error');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'form-error visible';
                errorDiv.textContent = message;
                errorDiv.setAttribute('role', 'alert');
                const parent = input.closest('.form-group');
                parent.appendChild(errorDiv);
                isValid = false;
            }

            if (!name.value.trim() || name.value.trim().length < 2) {
                showError(name, 'Por favor, informe seu nome completo.');
            }

            if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                showError(email, 'Por favor, informe um e-mail válido.');
            }

            const phoneDigits = phone.value.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                showError(phone, 'Por favor, informe um telefone válido.');
            }

            if (!goal.value) {
                showError(goal, 'Por favor, selecione uma opção.');
            }

            if (!isValid) {
                const firstError = form.querySelector('.error');
                if (firstError) firstError.focus();
                return;
            }

            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Prepare lead data
            const leadData = {
                name: name.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                goal: goal.value,
                source_page: window.location.pathname || 'landing-page',
                user_agent: navigator.userAgent
            };

            try {
                const sb = getSupabase();

                if (!sb) {
                    // Supabase SDK not loaded — fallback graceful
                    console.warn('Supabase SDK not available. Storing lead locally.');
                    storeFallbackLead(leadData);
                    showSuccess();
                    return;
                }

                const { error } = await sb.from('leads').insert([leadData]);

                if (error) {
                    console.error('Supabase insert error:', error);
                    // Still show success to user (don't block UX) but store locally
                    storeFallbackLead(leadData);
                }

                showSuccess();

            } catch (err) {
                console.error('Network error:', err);
                // Graceful fallback — store locally and show success
                storeFallbackLead(leadData);
                showSuccess();
            }
        });

        function showSuccess() {
            submitBtn.classList.remove('loading');
            form.style.display = 'none';
            formSuccess.classList.add('visible');
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function storeFallbackLead(data) {
            // Store in localStorage as backup when Supabase is unreachable
            try {
                const existing = JSON.parse(localStorage.getItem('lidmeed_pending_leads') || '[]');
                existing.push({ ...data, timestamp: new Date().toISOString() });
                localStorage.setItem('lidmeed_pending_leads', JSON.stringify(existing));
            } catch (e) {
                console.error('LocalStorage fallback failed:', e);
            }
        }
    }

    /* ========================================
       7. PARALLAX LIGHT EFFECTS
       ======================================== */
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const glowElements = document.querySelectorAll('.hero-glow');
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            glowElements.forEach((glow, i) => {
                const speed = 0.1 + i * 0.05;
                glow.style.transform = `translateX(-50%) translateY(${scrollY * speed}px)`;
            });
        }, { passive: true });
    }

    /* ========================================
       8. TYPEWRITER EFFECT FOR CODE BLOCK
       ======================================== */
    const codeBlock = document.querySelector('.visual-card-body code');
    if (codeBlock && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const originalHTML = codeBlock.innerHTML;
        const codeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate typing cursor effect
                    codeBlock.style.borderRight = '2px solid var(--color-accent-cyan)';
                    codeBlock.style.animation = 'blink-caret 0.75s step-end infinite';
                    
                    setTimeout(() => {
                        codeBlock.style.borderRight = 'none';
                        codeBlock.style.animation = 'none';
                    }, 3000);
                    
                    codeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        codeObserver.observe(codeBlock);
    }
});

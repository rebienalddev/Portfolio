// --- TS-PARTICLES CONFIG ---
        async function loadParticles(options) {
            await tsParticles.load("tsparticles", {
                "particles": {
                    "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                    "color": { "value": "#00fff0" },
                    "shape": { "type": "circle" },
                    "opacity": { "value": 0.5, "random": false },
                    "size": { "value": 2, "random": true },
                    "line_linked": { "enable": true, "distance": 150, "color": "#00fff0", "opacity": 0.4, "width": 1 },
                    "move": { "enable": true, "speed": 2, "direction": "none", "out_mode": "out" }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": {
                        "onhover": { "enable": true, "mode": "repulse" },
                        "onclick": { "enable": true, "mode": "push" },
                        "resize": true
                    },
                    "modes": {
                        "repulse": { "distance": 100, "duration": 0.4 },
                        "push": { "particles_nb": 4 }
                    }
                },
                "retina_detect": true
            });
        }
        
        function toggleParticles() {
            const body = document.body;
            if (body.classList.contains('dark-mode')) {
                if (!document.getElementById('tsparticles').hasChildNodes()) {
                    loadParticles();
                }
            } else {
                const particlesInstance = tsParticles.domItem(0);
                if (particlesInstance) {
                    particlesInstance.destroy();
                }
            }
        }

        // --- THEME TOGGLE SCRIPT ---
        const themeToggle = document.getElementById('themeToggle');
        const body = document.body;

        if (sessionStorage.getItem('darkMode') === 'disabled') {
            body.classList.remove('dark-mode');
            themeToggle.textContent = '🌙';
        } else {
            body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        }
        toggleParticles(); 

        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                sessionStorage.setItem('darkMode', 'enabled');
                themeToggle.textContent = '☀️';
            } else {
                sessionStorage.setItem('darkMode', 'disabled');
                themeToggle.textContent = '🌙';
            }
            toggleParticles();
        });

        // --- HAMBURGER & SCROLL SCRIPT ---
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });

        // --- ON-SCROLL FADE-IN SCRIPT ---
        const faders = document.querySelectorAll('.fade-in');
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        faders.forEach(fader => {
            observer.observe(fader);
        });

        // --- EMAILJS FORM SCRIPT (FROM YOUR FILE) ---
        (function() {
            // Using the User ID from YOUR provided code
            emailjs.init("XY57OAJ-ns3N0rlnJ"); 
        })();

        const contactForm = document.getElementById('contactForm');
        const submitBtn = document.getElementById('submitBtn');
        const formStatus = document.getElementById('formStatus');

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
            submitBtn.disabled = true;
            formStatus.innerHTML = '';
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                time: new Date().toLocaleString(),
                to_email: "rebienaldev@gmail.com"
            };
            
            try {
                // Using the Service ID and Template ID from YOUR provided code
                const response = await emailjs.send(
                    'service_nyns041', 
                    'template_m3y5b2o', 
                    formData
                );
                
                formStatus.innerHTML = '<div class="status-message success">Message sent successfully! I\'ll get back to you soon.</div>';
                contactForm.reset();
            } catch (error) {
                console.error('Failed to send message:', error);
                formStatus.innerHTML = '<div class="status-message error">Sorry, there was an error. Please try again or contact me directly.</div>';
            } finally {
                submitBtn.innerHTML = 'Send Message';
                submitBtn.disabled = false;
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            });
        });
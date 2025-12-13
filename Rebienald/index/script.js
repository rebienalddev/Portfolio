   // --- TS-PARTICLES CONFIG ---
        // This is the configuration for the "Cyber-Matrix" background
        // It runs automatically after the library is loaded
        async function loadParticles(options) {
            await tsParticles.load("tsparticles", {
                "particles": {
                    "number": {
                        "value": 80, // Number of dots
                        "density": {
                            "enable": true,
                            "value_area": 800
                        }
                    },
                    "color": {
                        "value": "#00fff0" // Color of dots
                    },
                    "shape": {
                        "type": "circle"
                    },
                    "opacity": {
                        "value": 0.5,
                        "random": false,
                        "anim": {
                            "enable": false
                        }
                    },
                    "size": {
                        "value": 2, // Size of dots
                        "random": true,
                        "anim": {
                            "enable": false
                        }
                    },
                    "line_linked": {
                        "enable": true,
                        "distance": 150,
                        "color": "#00fff0", // Color of lines
                        "opacity": 0.4,
                        "width": 1
                    },
                    "move": {
                        "enable": true,
                        "speed": 2,
                        "direction": "none",
                        "random": false,
                        "straight": false,
                        "out_mode": "out",
                        "bounce": false
                    }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": {
                        "onhover": {
                            "enable": true,
                            "mode": "repulse" // Dots run away from mouse
                        },
                        "onclick": {
                            "enable": true,
                            "mode": "push" // Click to add more dots
                        },
                        "resize": true
                    },
                    "modes": {
                        "repulse": {
                            "distance": 100,
                            "duration": 0.4
                        },
                        "push": {
                            "particles_nb": 4
                        }
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
            toggleParticles(); // Run on toggle
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
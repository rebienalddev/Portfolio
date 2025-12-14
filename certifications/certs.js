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
        // Load particles only if they haven't been loaded already (no child nodes)
        if (!document.getElementById('tsparticles').hasChildNodes()) {
            loadParticles();
        }
    } else {
        const particlesInstance = tsParticles.domItem(0);
        if (particlesInstance) {
            // Destroy particles when switching to light mode
            particlesInstance.destroy();
        }
    }
}

// --- THEME TOGGLE SCRIPT ---
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Initialize theme based on sessionStorage
if (sessionStorage.getItem('darkMode') === 'disabled') {
    body.classList.remove('dark-mode');
    themeToggle.textContent = '🌙';
} else {
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}
toggleParticles(); // Initialize particles based on current theme

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

// Close nav menu when a link is clicked
navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    }
});

// --- ON-SCROLL FADE-IN SCRIPT (FIXED FOR INITIAL LOAD) ---
const faders = document.querySelectorAll('.fade-in');

const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1 // Use 0.1 (10% visibility) as a solid starting point
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

function checkInitialVisibility() {
    faders.forEach(fader => {
        const rect = fader.getBoundingClientRect();
        
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            fader.classList.add('is-visible');
            if (observer) {
                observer.unobserve(fader);
            }
        }
    });
}

window.addEventListener('load', checkInitialVisibility);


const modal = document.getElementById("certModal");
const modalImg = document.getElementById("modalImg");

function openModal(imageSrc) {
 
    modalImg.src = "../images/" + imageSrc; 
    
  
    modalImg.src = `../images/${imageSrc}`; 
    
    modal.style.display = "block";
}

function closeModal() {
    modal.style.display = "none";
}

// Close modal on outside click
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal on Escape key press
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// --- THEME TOGGLE SCRIPT ---
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check saved preference
if (sessionStorage.getItem('darkMode') === 'disabled') {
    body.classList.remove('dark-mode');
    themeToggle.textContent = '🌙';
} else {
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

// Toggle logic
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        sessionStorage.setItem('darkMode', 'enabled');
        themeToggle.textContent = '☀️';
    } else {
        sessionStorage.setItem('darkMode', 'disabled');
        themeToggle.textContent = '🌙';
    }
});

// --- HAMBURGER MENU SCRIPT ---
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu when a link is clicked
navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    }
});

// --- EMAILJS FORM SCRIPT ---
(function() {
    emailjs.init("XY57OAJ-ns3N0rlnJ"); 
})();

const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // UI Feedback
    submitBtn.innerHTML = 'Sending...';
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
        await emailjs.send(
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

// --- SMOOTH SCROLLING FOR ANCHOR LINKS ---
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
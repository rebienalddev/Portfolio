const certificates = [
    {
        file: "Responsive Web Design.jpg",
        title: "Responsive Web Design",
        meta: "freeCodeCamp"
    },
    {
        file: "Repweb.png",
        title: "Responsive Web Design",
        meta: "freeCodeCamp"
    },
    {
        file: "Data.png",
        title: "JavaScript Algorithms and Data Structures",
        meta: "freeCodeCamp"
    },
    {
        file: "javaewan.jpg",
        title: "Java Certificate",
        meta: "HackerRank"
    },
    {
        file: "lega.png",
        title: "Legacy Responsive Web Design",
        meta: "freeCodeCamp"
    },
    {
        file: "Web Development.png",
        title: "Web Development",
        meta: "Simplilearn"
    },
    {
        file: "WebDevelopment2.png",
        title: "Web Development",
        meta: "Simplilearn"
    },
    {
        file: "Java Certificate_.jpg",
        title: "Java Programming",
        meta: "Simplilearn"
    },
    {
        file: "CSS Certificate_.png",
        title: "Introduction to CSS",
        meta: "Simplilearn"
    },
    {
        file: "CSS Front-End.jpg",
        title: "Front End Development - CSS",
        meta: "Great Learning"
    },
    {
        file: "HTML Front-End.png",
        title: "Front End Development - HTML",
        meta: "Great Learning"
    },
    {
        file: "TechTalk.png",
        title: "TechTalk Episode One: Resource Speaker",
        meta: "STI College Bacoor"
    },
    {
        file: "techtalk2.jpg",
        title: "TechTalk Episode Two: Resource Speaker",
        meta: "STI College Bacoor"
    },
    {
        file: "webdesign1.jpg",
        title: "Web Design Competition",
        meta: "STI College Bacoor"
    }
];

const navLinks = document.getElementById("navLinks");
const hamburger = document.getElementById("hamburger");
const grid = document.getElementById("certificationsGrid");
const modal = document.getElementById("certModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const closeModalButton = document.getElementById("closeModal");

function renderCertificates() {
    grid.innerHTML = certificates.map((cert) => {
        const src = `../images/${cert.file}`;
        return `
            <article class="certification-card reveal">
                <button class="cert-img-container" type="button" data-src="${src}" data-title="${cert.title}" aria-label="Preview ${cert.title}">
                    <img src="${src}" alt="${cert.title} certificate" class="cert-img" loading="lazy">
                </button>
                <div class="cert-content">
                    <h2 class="cert-title">${cert.title}</h2>
                    <p class="cert-meta">${cert.meta}</p>
                </div>
            </article>
        `;
    }).join("");
}

function openModal(src, title) {
    modalImg.src = src;
    modalImg.alt = `${title} certificate`;
    modalTitle.textContent = title;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function setupReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

renderCertificates();
setupReveal();

hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

navLinks.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
        navLinks.classList.remove("active");
    }
});

grid.addEventListener("click", (event) => {
    const button = event.target.closest(".cert-img-container");
    if (!button) return;
    openModal(button.dataset.src, button.dataset.title);
});

closeModalButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
    }
});

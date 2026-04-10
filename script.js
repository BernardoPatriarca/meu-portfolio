const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

(function lerpRing() {
    ringX += (mouseX - ringX) * .12;
    ringY += (mouseY - ringY) * .12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(lerpRing);
})();

document.querySelectorAll('a, button, .skill-tag, .tilt-card, .nav-btn').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); cursorRing.classList.add('hovering'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); cursorRing.classList.remove('hovering'); });
});

const progressBar = document.getElementById('progress');
window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    progressBar.style.width = pct + '%';
});

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resizeCanvas() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); });

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - .5) * .28;
        this.vy = (Math.random() - .5) * .28;
        this.r = Math.random() * 1.4 + .3;
        this.a = Math.random() * .5 + .1;
        this.c = Math.random() > .55 ? 'rgba(79,142,247,' : 'rgba(168,85,247,';
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.c + this.a + ')';
        ctx.fill();
    }
}

const PCOUNT = window.innerWidth < 768 ? 40 : 85;
for (let i = 0; i < PCOUNT; i++) particles.push(new Particle());

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 130) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = 'rgba(79,142,247,' + ((1 - d / 130) * .055) + ')';
                ctx.lineWidth = .4;
                ctx.stroke();
            }
        }
    }
}

(function animParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animParticles);
})();

const navbar = document.getElementById('navbar');
const backTop = document.getElementById('back-top');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    backTop.classList.toggle('show', window.scrollY > 400);
});

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

sections.forEach(sec => {
    new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                navLinks.forEach(a => a.classList.remove('active'));
                const link = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
                if (link) link.classList.add('active');
            }
        });
    }, { threshold: 0.35 }).observe(sec);
});

const themeBtn = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);
themeBtn.querySelector('i').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

themeBtn.addEventListener('click', () => {
    const t = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    themeBtn.querySelector('i').className = t === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
});

document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navMobile').classList.toggle('open');
});
document.querySelectorAll('.nav-mobile a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('navMobile').classList.remove('open'));
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const el = document.querySelector(a.getAttribute('href'));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObs.unobserve(e.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-group').forEach(el => revealObs.observe(el));

const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.lang-bar-fill').forEach((bar, i) => {
                setTimeout(() => {
                    bar.style.transform = `scaleX(${bar.dataset.width})`;
                    bar.classList.add('animated');
                }, 280 + i * 120);
            });
            barObs.unobserve(e.target);
        }
    });
}, { threshold: 0.3 });
document.querySelectorAll('.lang-card').forEach(c => barObs.observe(c));

const phrases = ['Full Stack Developer', 'Angular & Java Dev', 'UI/UX Enthusiast', 'Problem Solver', 'Open to Opportunities'];
let phraseIndex = 0, charIndex = 0, deleting = false;
const twEl = document.getElementById('tw-text');

function typeWriter() {
    const current = phrases[phraseIndex];
    if (!deleting) {
        twEl.textContent = current.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
            deleting = true;
            setTimeout(typeWriter, 1700);
            return;
        }
    } else {
        twEl.textContent = current.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
        }
    }
    setTimeout(typeWriter, deleting ? 55 : 88);
}
setTimeout(typeWriter, 1100);

document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - .5) * 14;
        const y = ((e.clientY - rect.top) / rect.height - .5) * -14;
        card.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * .22;
        const y = (e.clientY - rect.top - rect.height / 2) * .22;
        btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});
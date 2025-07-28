AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: false
        });

        const particlesConfig = {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.6,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 3,
                        "opacity_min": 0.2,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 3,
                        "size_min": 0.3,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.2,
                    "width": 2
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": true,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "repulse"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
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
        };

        function initParticles() {
            const currentTheme = document.body.getAttribute('data-theme');
            const particlesColor = currentTheme === 'dark' ? '#ffffff' : '#ffffff';

            particlesConfig.particles.color.value = particlesColor;
            particlesConfig.particles.line_linked.color = particlesColor;

            if (window.pJSDom && window.pJSDom.length > 0) {
                window.pJSDom[0].pJS.fn.vendors.destroypJS();
                window.pJSDom = [];
            }

            particlesJS('particles-js', particlesConfig);
        }

        const themeToggle = document.getElementById('themeToggle');
        const themeToggleMobile = document.getElementById('themeToggleMobile');
        const body = document.body;
        const currentTheme = localStorage.getItem('theme');

        if (currentTheme) {
            body.setAttribute('data-theme', currentTheme);
            updateThemeIcon(currentTheme);
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            initParticles();
        });

        if (themeToggleMobile) {
            themeToggleMobile.addEventListener('click', () => {
                themeToggle.click();
            });
        }

        function updateThemeIcon(theme) {
            const icon = themeToggle.querySelector('i');
            if (theme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }

        window.addEventListener('scroll', function () {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        window.addEventListener('scroll', function () {
            const backToTop = document.querySelector('.back-to-top');
            if (window.scrollY > 300) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70,
                        behavior: 'smooth'
                    });

                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse.classList.contains('show')) {
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                        bsCollapse.hide();
                    }
                }
            });
        });

        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', function () {
            AOS.refresh();
        });

        window.addEventListener('scroll', function () {
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;

                if (pageYOffset >= (sectionTop - 100)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });

        function animateSkills() {
            const skillsSection = document.getElementById('skills');
            const skillBars = document.querySelectorAll('.skill-progress');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        skillBars.forEach(bar => {
                            bar.style.width = '0';
                            setTimeout(() => {
                                const width = bar.parentElement.previousElementSibling.lastElementChild.textContent;
                                bar.style.width = width;
                            }, 100);
                        });
                    } else {
                        skillBars.forEach(bar => {
                            bar.style.width = '0';
                        });
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(skillsSection);
        }
        const magneticButtons = document.querySelectorAll('.magnetic');

        magneticButtons.forEach(button => {
            const strength = parseInt(button.getAttribute('data-strength')) || 20;

            button.addEventListener('mousemove', (e) => {
                const { left, top, width, height } = button.getBoundingClientRect();
                const x = e.clientX - left - width / 2;
                const y = e.clientY - top - height / 2;

                button.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
            });

            button.addEventListener('mouseout', () => {
                button.style.transform = 'translate(0, 0)';
            });
        });

        document.querySelectorAll('.form-control').forEach(input => {
            if (input.value) {
                input.nextElementSibling.classList.add('active');
            }

            input.addEventListener('focus', () => {
                input.nextElementSibling.classList.add('active');
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.nextElementSibling.classList.remove('active');
                }
            });
        });

        document.addEventListener('DOMContentLoaded', function () {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: false
            });

            animateSkills();
            initParticles();

            window.addEventListener('resize', function () {
                AOS.refresh();
            });
        });
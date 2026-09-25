// Enhanced Portfolio JavaScript
class Portfolio {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupSkillAnimation();
        this.setupTypewriter();
        this.setupThemeToggle();
        this.setupScrollTop();
        this.setupContactForm();
        this.hideLoadingScreen();
        this.setupParticleBackground();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                this.animateMenuIcon(mobileMenuBtn);
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    // Close mobile menu if open
                    if (navLinks && navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                    }
                    
                    // Smooth scroll to target
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update active nav link
                    this.updateActiveNavLink(anchor);
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            this.handleNavbarScroll();
            this.updateScrollProgress();
            this.toggleScrollTopButton();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        });
    }

    animateMenuIcon(btn) {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                icon.style.transform = 'rotate(0deg)';
            }, 300);
        }
    }

    updateActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    handleNavbarScroll() {
        const nav = document.querySelector('nav');
        if (nav) {
            if (window.scrollY > 100) {
                nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                nav.style.backdropFilter = 'blur(10px)';
            } else {
                nav.style.backgroundColor = 'var(--white)';
                nav.style.backdropFilter = 'none';
            }
        }
    }

    updateScrollProgress() {
        const scrollProgress = document.createElement('div');
        scrollProgress.id = 'scroll-progress';
        scrollProgress.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--accent));
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        
        if (!document.getElementById('scroll-progress')) {
            document.body.appendChild(scrollProgress);
        }
        
        const progress = document.getElementById('scroll-progress');
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progress.style.width = `${scrollPercent}%`;
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger counter animation for stats
                    if (entry.target.classList.contains('stat-number')) {
                        this.animateCounter(entry.target);
                    }
                    
                    // Trigger skill bar animation
                    if (entry.target.closest('.skills-container')) {
                        this.animateSkillBars();
                    }
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        document.querySelectorAll('.fade-in').forEach(element => {
            observer.observe(element);
        });

        // Observe stat numbers
        document.querySelectorAll('.stat-number').forEach(element => {
            observer.observe(element);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.textContent) || 0;
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (target - start) * easeOutQuart);
            
            element.textContent = current + (element.textContent.includes('+') ? '+' : '');
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    setupSkillAnimation() {
        this.skillAnimated = false;
    }

    animateSkillBars() {
        if (this.skillAnimated) return;
        
        const skillBars = document.querySelectorAll('.skill-progress');
        skillBars.forEach((bar, index) => {
            setTimeout(() => {
                const width = bar.getAttribute('data-width') || bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            }, index * 200);
        });
        
        this.skillAnimated = true;
    }

    setupTypewriter() {
        const typewriterElement = document.querySelector('.typewriter');
        if (!typewriterElement) return;

        const texts = [
            'Junior AI Engineer',
            'Generative AI & LLM Developer',
            'AI Agents and RAG Specialist',
            'Machine Learning Researcher',
            'Cloud AI Engineer'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const typeSpeed = 100;
        const deleteSpeed = 50;
        const pauseTime = 2000;

        const type = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typewriterElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriterElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            let speed = isDeleting ? deleteSpeed : typeSpeed;

            if (!isDeleting && charIndex === currentText.length) {
                speed = pauseTime;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
            }

            setTimeout(type, speed);
        };

        type();
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const theme = document.documentElement.getAttribute('data-theme');
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                // Update icon
                const icon = themeToggle.querySelector('i');
                if (icon) {
                    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
                
                // Add transition effect
                document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
                setTimeout(() => {
                    document.body.style.transition = '';
                }, 300);
            });
        }
    }

    setupScrollTop() {
        const scrollTopBtn = document.getElementById('scrollTop');
        
        if (scrollTopBtn) {
            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    toggleScrollTopButton() {
        const scrollTopBtn = document.getElementById('scrollTop');
        if (scrollTopBtn) {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
    }

    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(contactForm);
            });
            
            // Add input validation
            const inputs = contactForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateInput(input));
                input.addEventListener('input', () => this.clearValidationErrors(input));
            });
        }
    }

    validateInput(input) {
        const value = input.value.trim();
        const type = input.type;
        let isValid = true;
        let message = '';

        // Remove existing error styles
        input.classList.remove('error');
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Validation rules
        if (input.hasAttribute('required') && !value) {
            isValid = false;
            message = `${input.labels[0].textContent} is required`;
        } else if (type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        } else if (input.name === 'name' && value && value.length < 2) {
            isValid = false;
            message = 'Name must be at least 2 characters long';
        }

        if (!isValid) {
            input.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.style.cssText = 'color: var(--accent); font-size: 0.8rem; margin-top: 0.5rem;';
            input.parentNode.appendChild(errorDiv);
        }

        return isValid;
    }

    clearValidationErrors(input) {
        input.classList.remove('error');
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async handleFormSubmission(form) {
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Validate all inputs
        const inputs = form.querySelectorAll('input, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showNotification('Please fix the errors before submitting', 'error');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            // Simulate form submission (replace with actual form handling)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            this.showNotification('Message sent successfully!', 'success');
            form.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--accent)' : 'var(--primary)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: 0 10px 25px var(--shadow);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = 'background: none; border: none; color: white; cursor: pointer; margin-left: 1rem;';
        
        const closeNotification = () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        };

        closeBtn.addEventListener('click', closeNotification);

        // Auto close after 5 seconds
        setTimeout(closeNotification, 5000);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1000);
        }
    }

    setupParticleBackground() {
        // Simple particle system for header background
        const header = document.querySelector('header');
        if (!header) return;

        const particleCount = 50;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
            `;
            
            // Random position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            // Random animation delay
            particle.style.animationDelay = Math.random() * 2 + 's';
            
            header.appendChild(particle);
            particles.push({
                element: particle,
                x: Math.random() * window.innerWidth,
                y: Math.random() * header.offsetHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }

        // Animate particles
        const animateParticles = () => {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Boundary check
                if (particle.x < 0 || particle.x > window.innerWidth) {
                    particle.vx *= -1;
                }
                if (particle.y < 0 || particle.y > header.offsetHeight) {
                    particle.vy *= -1;
                }

                particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
            });

            requestAnimationFrame(animateParticles);
        };

        animateParticles();
    }

    // Utility method to add CSS animations
    addGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                font-family: inherit;
            }
            
            .form-control.error {
                border-color: var(--accent);
                box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
            }
            
            .particle {
                animation: float 3s infinite ease-in-out;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const portfolio = new Portfolio();
    portfolio.addGlobalStyles();
});

// Add some utility functions
window.portfolioUtils = {
    // Smooth scroll to element
    scrollTo: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    // Download CV function
    downloadCV: () => {
        const link = document.createElement('a');
        link.href = 'CV_Mhamed_Garbaa.pdf';
        link.download = 'CV_Mhamed_Garbaa.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    // Copy email to clipboard
    copyEmail: async () => {
        try {
            await navigator.clipboard.writeText('Mhamedgarbaa04@gmail.com');
            if (window.portfolio) {
                window.portfolio.showNotification('Email copied to clipboard!', 'success');
            }
        } catch (err) {
            console.error('Failed to copy email:', err);
        }
    }
};

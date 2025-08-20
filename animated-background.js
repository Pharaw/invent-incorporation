/**
 * Interactive Animated Background System
 * Creates dynamic, responsive background animations for Invent Incorporated
 */

class AnimatedBackground {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseMoving = false;
        this.animationId = null;
        this.config = {
            particleCount: 50,
            particleSize: 2,
            particleSpeed: 0.5,
            connectionDistance: 150,
            mouseInteraction: true,
            colorScheme: {
                primary: '#079992',
                secondary: '#0a3d62',
                accent: '#ffffff',
                glow: 'rgba(7, 153, 146, 0.3)'
            }
        };
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.createParticles();
        this.animate();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'animated-background';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-10';
        this.canvas.style.pointerEvents = 'none';
        
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        if (this.config.mouseInteraction) {
            document.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                this.isMouseMoving = true;
                
                setTimeout(() => {
                    this.isMouseMoving = false;
                }, 100);
            });
        }
    }

    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.particleSpeed,
                vy: (Math.random() - 0.5) * this.config.particleSpeed,
                size: Math.random() * this.config.particleSize + 1,
                color: this.getRandomColor(),
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }

    getRandomColor() {
        const colors = [
            this.config.colorScheme.primary,
            this.config.colorScheme.secondary,
            this.config.colorScheme.accent
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateParticles();
        this.drawConnections();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
            }

            // Mouse interaction
            if (this.config.mouseInteraction && this.isMouseMoving) {
                const dx = this.mouseX - particle.x;
                const dy = this.mouseY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.vx += (dx / distance) * force * 0.01;
                    particle.vy += (dy / distance) * force * 0.01;
                }
            }

            // Apply friction
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        });
    }

    drawConnections() {
        this.ctx.strokeStyle = this.config.colorScheme.glow;
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.connectionDistance) {
                    this.ctx.globalAlpha = (1 - distance / this.config.connectionDistance) * 0.3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.globalAlpha = 1;
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add glow effect
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        this.ctx.globalAlpha = 1;
    }

    // Additional interactive features
    addInteractiveElements() {
        // Add floating icons
        const floatingContainer = document.createElement('div');
        floatingContainer.className = 'floating-elements';
        floatingContainer.innerHTML = `
            <i class="fas fa-shield-alt floating-icon icon1"></i>
            <i class="fas fa-handshake floating-icon icon2"></i>
            <i class="fas fa-chart-line floating-icon icon3"></i>
            <i class="fas fa-users floating-icon icon4"></i>
            <i class="fas fa-globe floating-icon icon5"></i>
        `;
        
        document.body.appendChild(floatingContainer);
        
        // Add CSS for floating elements
        const style = document.createElement('style');
        style.textContent = `
            .floating-elements {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -5;
            }
            
            .floating-icon {
                position: absolute;
                font-size: 24px;
                color: rgba(7, 153, 146, 0.3);
                animation: float 6s ease-in-out infinite;
                z-index: -5;
            }
            
            .floating-icon.icon1 { top: 20%; left: 10%; animation-delay: 0s; }
            .floating-icon.icon2 { top: 60%; left: 80%; animation-delay: 2s; }
            .floating-icon.icon3 { top: 80%; left: 20%; animation-delay: 4s; }
            .floating-icon.icon4 { top: 30%; left: 70%; animation-delay: 1s; }
            .floating-icon.icon5 { top: 70%; left: 50%; animation-delay: 3s; }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(180deg); }
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .floating-icon {
                    font-size: 18px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize the animated background when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animatedBg = new AnimatedBackground();
    
    // Add interactive elements
    animatedBg.addInteractiveElements();
    
    // Add page-specific enhancements
    const bodyClass = document.body.className;
    
    if (bodyClass.includes('home-page')) {
        // Add extra particles for home page
        animatedBg.config.particleCount = 75;
        animatedBg.createParticles();
    }
});

// Add scroll-based animations
window.addEventListener('scroll', () => {
    const scrollPercent = window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (scrollIndicator) {
        scrollIndicator.style.opacity = 1 - scrollPercent * 2;
    }
});

// Add click effects
document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    ripple.style.width = '0';
    ripple.style.height = '0';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(7, 153, 146, 0.5)';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '9999';
    
    document.body.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
});

// Add CSS for ripple effect
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            width: 100px;
            height: 100px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

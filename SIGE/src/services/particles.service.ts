import { Injectable, ElementRef } from '@angular/core';
import { gsap } from 'gsap';

interface Particle {
  element: HTMLElement;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
}

@Injectable({
  providedIn: 'root'
})
export class ParticlesService {
  private particles: Particle[] = [];
  private container: HTMLElement | null = null;
  private animationId: number | null = null;
  private mouseX: number = 0;
  private mouseY: number = 0;

  initParticles(containerRef: ElementRef, count: number = 30) {
    this.container = containerRef.nativeElement;
    this.createParticles(count);
    this.setupMouseTracking();
    this.animate();
  }

  private createParticles(count: number) {
    const containerWidth = this.container!.clientWidth;
    const containerHeight = this.container!.clientHeight;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const size = Math.random() * 4 + 1;
      const opacity = Math.random() * 0.5 + 0.1;
      
      gsap.set(particle, {
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#ffffff',
        borderRadius: '50%',
        position: 'absolute',
        opacity: opacity
      });

      this.container!.appendChild(particle);
      
      this.particles.push({
        element: particle,
        x: Math.random() * containerWidth,
        y: Math.random() * containerHeight,
        size: size,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5
      });
    }
  }

  private setupMouseTracking() {
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  private animate() {
    const updateParticles = () => {
      const containerWidth = this.container!.clientWidth;
      const containerHeight = this.container!.clientHeight;

      for (const particle of this.particles) {
        // Actualizar la posición
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Rebote en los bordes
        if (particle.x < 0 || particle.x > containerWidth) {
          particle.speedX *= -1;
        }
        
        if (particle.y < 0 || particle.y > containerHeight) {
          particle.speedY *= -1;
        }
        
        // Efecto de atracción al mouse (sutil)
        const dx = this.mouseX - particle.x;
        const dy = this.mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (200 - distance) / 200;
          
          particle.speedX += forceDirectionX * force * 0.02;
          particle.speedY += forceDirectionY * force * 0.02;
        }
        
        // Limitar la velocidad
        const maxSpeed = 2;
        const currentSpeed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
        
        if (currentSpeed > maxSpeed) {
          particle.speedX = (particle.speedX / currentSpeed) * maxSpeed;
          particle.speedY = (particle.speedY / currentSpeed) * maxSpeed;
        }
        
        // Aplicar la posición
        gsap.set(particle.element, {
          x: particle.x,
          y: particle.y
        });
      }
      
      this.animationId = requestAnimationFrame(updateParticles);
    };
    
    this.animationId = requestAnimationFrame(updateParticles);
  }

  cleanUp() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.container) {
      this.particles.forEach(particle => {
        if (this.container?.contains(particle.element)) {
          this.container!.removeChild(particle.element);
        }
      });
      
      this.particles = [];
    }
  }
}
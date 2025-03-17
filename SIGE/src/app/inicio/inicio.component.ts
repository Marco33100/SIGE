import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ParticlesService } from '../../services/particles.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements AfterViewInit, OnDestroy {
  @ViewChild('homeContainer') homeContainer!: ElementRef;
  @ViewChild('title') title!: ElementRef;
  @ViewChild('subtitle') subtitle!: ElementRef;
  @ViewChild('particlesContainer') particlesContainer!: ElementRef;

  constructor(private particlesService: ParticlesService) {}

  ngAfterViewInit() {
    this.initAnimation();
    this.initMouseTracking();
    this.particlesService.initParticles(this.particlesContainer, 40);
  }

  ngOnDestroy() {
    this.particlesService.cleanUp();
  }

  initAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    
    tl.from(this.title.nativeElement, { 
      duration: 1.2, 
      y: 50, 
      opacity: 0 
    });
    
    tl.from(this.subtitle.nativeElement, { 
      duration: 1, 
      y: 30, 
      opacity: 0 
    }, "-=0.8");
  }

  initMouseTracking() {
    const container = this.homeContainer.nativeElement;
    const title = this.title.nativeElement;
    const subtitle = this.subtitle.nativeElement;
    
    container.addEventListener('mousemove', (e: MouseEvent) => {
        const x = e.clientX;
        const y = e.clientY;
        
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calcular desplazamiento relativo al centro
        const moveX = (x - windowWidth / 2) / 50;
        const moveY = (y - windowHeight / 2) / 50;
        
        // Aplicar transformación suave
        gsap.to(title, {
            x: moveX * 1.5,
            y: moveY * 1.5,
            duration: 1,
            ease: 'power1.out'
        });
        
        gsap.to(subtitle, {
            x: moveX * 0.8,
            y: moveY * 0.8,
            duration: 1.2,
            ease: 'power1.out'
        });
        
        // Efecto de iluminación basado en la posición del mouse
        const lightX = (x / windowWidth) * 100;
        const lightY = (y / windowHeight) * 100;
        
        container.style.background = `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(173, 216, 230, 0.4), rgba(255, 255, 255, 0.9)), #ffffff`;
    });
}
}
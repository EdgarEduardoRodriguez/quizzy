import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-encabezado',
  imports: [CommonModule, FormsModule],
  templateUrl: './encabezado.component.html',
  styleUrl: './encabezado.component.css'
})
export class Encabezado implements OnInit {
  menuItems: string[] = ['inicio', 'login', 'registro'];

  // Propiedades para el usuario logueado
  isLoggedIn: boolean = false;
  userInitials: string = '';
  userName: string = '';
  userEmail: string = '';
  showDropdown: boolean = false;

  // Propiedades para el modal de crear cuestionario
  showCreateModal: boolean = false;
  quizName: string = '';

  constructor(private router: Router, private location: Location) {}

  ngOnInit() {
    this.checkLoginStatus();
    // Verificar estado de login cada vez que cambie la ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkLoginStatus();
      }
    });
  }

  // Listener para clicks fuera del dropdown
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.profile-dropdown');
    const profileButton = document.querySelector('.profile-button');

    // Si el click no es en el dropdown ni en el botón, cerrar el dropdown
    if (this.showDropdown && dropdown && profileButton &&
        !dropdown.contains(target) && !profileButton.contains(target)) {
      this.showDropdown = false;
    }
  }

  onMenuClick(item: string) {
    if (item === 'inicio') {
      this.router.navigate(['/home']);
      return;
    }
    if (item === 'registro') {
      this.router.navigate(['/registro']);
      return;
    }
    if (item === 'login') {
      this.router.navigate(['/login']);
      return;
    }
  }

  isCrearCuestionarioPage(): boolean {
    return this.router.url === '/crear-cuestionario';
  }

  shouldShowNormalButtons(): boolean {
    return this.router.url === '/home';
  }

  onCrearCuestionario() {
    this.showCreateModal = true;
    this.quizName = '';
  }

  goBack() {
    this.location.back();
  }

  shouldShowBackButton(): boolean {
    return this.router.url === '/crear-cuestionario-form';
  }

  checkLoginStatus() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.isLoggedIn = true;
        this.userName = `${user.first_name} ${user.last_name}`;
        this.userEmail = user.email;
        this.userInitials = this.getUserInitials(user.first_name, user.last_name);
        console.log('Usuario logueado detectado:', this.userInitials);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout();
      }
    } else {
      this.isLoggedIn = false;
      this.userInitials = '';
      this.userName = '';
      this.userEmail = '';
    }
  }

  getUserInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown() {
    this.showDropdown = false;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.isLoggedIn = false;
    this.userInitials = '';
    this.userName = '';
    this.userEmail = '';
    this.showDropdown = false;
    this.router.navigate(['/home']);
  }

  // Métodos para el modal de crear cuestionario
  cerrarCreateModal() {
    this.showCreateModal = false;
    this.quizName = '';
  }

  crearCuestionarioDesdeNavbar() {
    if (this.quizName.trim()) {
      console.log('Creando cuestionario desde navbar:', this.quizName);
      alert(`¡Cuestionario "${this.quizName}" creado exitosamente!`);
      this.cerrarCreateModal();
      this.router.navigate(['/crear-cuestionario-form']);
    } else {
      alert('Por favor, ingresa un nombre para el cuestionario.');
    }
  }
}

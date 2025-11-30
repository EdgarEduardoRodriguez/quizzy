import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  // Propiedades del formulario
  loginForm = {
    email: '',
    password: ''
  };

  // Opción de recordar sesión
  rememberMe: boolean = false;

  // Me Mrjrdo
  errorMessage: string = '';

  constructor(private router: Router, private userService: UserService) {}

  // Método para manejar el envío del formulario de login
  onLoginSubmit() {
    if (this.loginForm.email && this.loginForm.password) {
      const credentials = {
        email: this.loginForm.email,
        password: this.loginForm.password
      };

      this.userService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          // Limpiar mensaje de error
          this.errorMessage = '';
          // Guardar tokens JWT en localStorage
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          // También guardar datos del usuario si están incluidos
          if (response.user) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
          this.router.navigate(['/welcome']);
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.errorMessage = 'Contraseña o usuario incorrectos';
        }
      });
    } else {
      alert('Por favor, completa todos los campos obligatorios.');
    }
  }

  // Método para login con Google
  onLoginGoogle() {
    alert('Funcionalidad de login con Google próximamente.');
  }

  // Método para ir a la página de registro
  goToRegistro() {
    this.router.navigate(['/registro']);
  }
}

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
          // Guardar datos del usuario en localStorage
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          alert('¡Inicio de sesión exitoso! Bienvenido de vuelta a Quizzy.');
          this.router.navigate(['/crear-cuestionario']);
        },
        error: (error) => {
          console.error('Error en login:', error);
          alert('Error en el login: ' + (error.error?.error || 'Credenciales inválidas'));
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

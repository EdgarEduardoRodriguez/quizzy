import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  // Propiedades del formulario
  registroForm = {
    nombre: '',
    apellidos: '',
    email: '',
    password: ''
  };

  // Código para unirse como participante
  codigoQuiz: string = '';

  constructor(private router: Router, private userService: UserService) {}

  // Método para manejar el envío del formulario de registro
  onRegistroSubmit() {
    if (this.registroForm.nombre && this.registroForm.apellidos &&
        this.registroForm.email && this.registroForm.password) {

      const userData = {
        email: this.registroForm.email,
        password: this.registroForm.password,
        first_name: this.registroForm.nombre,
        last_name: this.registroForm.apellidos
      };

      this.userService.register(userData).subscribe({
        next: (response) => {
          console.log('Usuario registrado:', response);
          alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error en registro:', error);
          alert('Error en el registro: ' + (error.error?.error || 'Error desconocido'));
        }
      });
    } else {
      alert('Por favor, completa todos los campos obligatorios.');
    }
  }

  // Método para unirse como participante con código
  onUnirseParticipante() {
    if (this.codigoQuiz.trim()) {
      // Aquí iría la lógica para validar el código
      console.log('Código introducido:', this.codigoQuiz);

      // Por ahora solo mostramos un mensaje
      alert(`Uniéndote al quiz con código: ${this.codigoQuiz}`);

      // Aquí podrías redirigir a la página del quiz
    } else {
      alert('Por favor, introduce un código válido.');
    }
  }

  // Método para registro con Webex
  onRegistroWebex() {
    alert('Funcionalidad de registro con Webex próximamente.');
  }

  // Método para registro con Google
  onRegistroGoogle() {
    alert('Funcionalidad de registro con Google próximamente.');
  }
}

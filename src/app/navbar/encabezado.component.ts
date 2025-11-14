import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


// el decorara component le dice a angular que esto es un componente
@Component({
  selector: 'app-encabezado',
  imports: [CommonModule],
  templateUrl: './encabezado.component.html',
  styleUrl: './encabezado.component.css'
})
export class Encabezado {
  // aqui puedo definir propiedades y metodos de tu barra
  menuItems: string[] = ['inicio', 'login', 'registro'];

  constructor(private router: Router) {}

  // este metodo se ejecuta cuando haces clic en un boton
  onMenuClick(item: string) {
    if (item === 'inicio') {
      this.router.navigate(['/home']);
      return;
    }

    const mensajes: { [key: string]: string } = {
      'login': 'Iniciar Sesión',
      'registro': 'Registrarse'
    };
    alert(`Hiciste click en: ${mensajes[item]}`);
  }

  // metodo para verificar si estamos en la pagina de crear cuestionario
  isCrearCuestionarioPage(): boolean {
    return this.router.url === '/crear-cuestionario' || this.router.url === '/crear-cuestionario-form';
  }

  // metodo para crear un nuevo cuestionario
  onCrearCuestionario() {
    this.router.navigate(['/crear-cuestionario-form']);
  }

}

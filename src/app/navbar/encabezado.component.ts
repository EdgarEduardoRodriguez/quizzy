import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common'; 


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

  constructor(private router: Router, private location: Location) {}

  // este metodo se ejecuta cuando haces clic en un boton
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

  // metodo para verificar si estamos en la pagina de crear cuestionario
  isCrearCuestionarioPage(): boolean {
    return this.router.url === '/crear-cuestionario';
  }

  // metodo para verificar si debemos mostrar los botones normales (inicio, login, registro)
  shouldShowNormalButtons(): boolean {
    return this.router.url === '/home';
  }

  // metodo para crear un nuevo cuestionario
  onCrearCuestionario() {
    this.router.navigate(['/crear-cuestionario-form']);
  }

  goBack() {
    this.location.back();
  }

  shouldShowBackButton(): boolean {
    return this.router.url === '/crear-cuestionario-form'; 
  }
}

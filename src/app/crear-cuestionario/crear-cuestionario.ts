import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionnaireService } from '../services/questionnaire.service';

@Component({
  selector: 'app-crear-cuestionario',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-cuestionario.html',
  styleUrl: './crear-cuestionario.css'
})
export class CrearCuestionario implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private questionnaireService: QuestionnaireService
  ) {}

  // propiedad para controlar si el sidebar esta colapsado
  isSidebarCollapsed: boolean = false;

  // Propiedad para el nombre del cuestionario desde navbar
  questionnaireName: string = '';
  questionnaireId: number | null = null;

  // Propiedades para cuestionarios
  questionnaires: any[] = [];
  filteredQuestionnaires: any[] = [];
  searchTerm: string = '';
  selectedQuestionnaires: any[] = [];

  ngOnInit() {
    // Cargar cuestionarios inicialmente
    this.loadQuestionnaires();

    // Obtener el nombre y ID del cuestionario desde los query params
    this.route.queryParams.subscribe(params => {
      this.questionnaireName = params['nombre'] || '';
      this.questionnaireId = params['id'] ? parseInt(params['id']) : null;
      console.log('Nombre del cuestionario recibido:', this.questionnaireName);
      console.log('ID del cuestionario recibido:', this.questionnaireId);

      // Si tenemos un ID, significa que acabamos de crear un cuestionario
      // recargamos la lista para incluir el nuevo cuestionario
      if (this.questionnaireId) {
        setTimeout(() => {
          this.loadQuestionnaires(() => {
            // Después de recargar, buscar y seleccionar el cuestionario recién creado
            const newQuestionnaire = this.questionnaires.find(q => q.id === this.questionnaireId);
            if (newQuestionnaire) {
              this.toggleSelection(newQuestionnaire);
            }
          });
        }, 1000); // Esperar un segundo para asegurar que el backend esté actualizado
      }
    });
  }

  volverHome() {
    this.router.navigate(['/home']);
  }

  // metodo para alternar el estado del sidebar
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // Método para cargar cuestionarios
  loadQuestionnaires(callback?: () => void) {
    this.questionnaireService.getQuestionnaires().subscribe({
      next: (data) => {
        this.questionnaires = data;
        this.filteredQuestionnaires = data;
        if (callback) {
          callback();
        }
      },
      error: (error) => {
        console.error('Error loading questionnaires:', error);
      }
    });
  }

  // Método para filtrar cuestionarios por búsqueda
  onSearch() {
    if (this.searchTerm.trim()) {
      this.filteredQuestionnaires = this.questionnaires.filter(q =>
        q.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredQuestionnaires = this.questionnaires;
    }
  }

  // Método para seleccionar cuestionario y navegar al formulario
  toggleSelection(questionnaire: any) {
    // Limpiar selección anterior
    this.selectedQuestionnaires = [questionnaire];

    // Navegar al formulario de crear preguntas con el nombre del cuestionario
    this.router.navigate(['/crear-cuestionario-form'], {
      queryParams: { nombre: questionnaire.title, id: questionnaire.id }
    });
  }

  // Método para verificar si un cuestionario está seleccionado
  isSelected(questionnaire: any): boolean {
    return this.selectedQuestionnaires.some(q => q.id === questionnaire.id);
  }

  // Método para seleccionar todos
  selectAll() {
    if (this.selectedQuestionnaires.length === this.filteredQuestionnaires.length) {
      this.selectedQuestionnaires = [];
    } else {
      this.selectedQuestionnaires = [...this.filteredQuestionnaires];
    }
  }

  // Método para verificar si todos están seleccionados
  areAllSelected(): boolean {
    return this.filteredQuestionnaires.length > 0 &&
           this.selectedQuestionnaires.length === this.filteredQuestionnaires.length;
  }

  // Método para ir a crear nuevo cuestionario
  crearNuevo() {
    this.router.navigate(['/crear-cuestionario-form']);
  }

  // Método para continuar con los cuestionarios seleccionados
  continuarConSeleccionados() {
    if (this.selectedQuestionnaires.length > 0) {
      // Aquí puedes implementar la lógica para continuar con los cuestionarios seleccionados
      // Por ejemplo, navegar a una página de quiz o guardar la selección
      console.log('Cuestionarios seleccionados:', this.selectedQuestionnaires);
      alert(`Has seleccionado ${this.selectedQuestionnaires.length} cuestionario(s). Funcionalidad pendiente de implementar.`);
    }
  }

  // Método para limpiar la selección
  limpiarSeleccion() {
    this.selectedQuestionnaires = [];
  }

  // Método para agregar pregunta al cuestionario
  agregarPregunta() {
    // Navegar al formulario de crear pregunta con el nombre del cuestionario
    this.router.navigate(['/crear-cuestionario-form'], {
      queryParams: { nombre: this.questionnaireName }
    });
  }

  // Método para ver las preguntas del cuestionario
  verPreguntas() {
    // Por ahora solo mostrar un mensaje
    alert('Funcionalidad para ver preguntas pendiente de implementar');
  }

  // metodo para eleminar un cuestionario
  deleteQuestionnaire(event: Event, questionnaire: any) {
    // prevenir que el evento se propage al contenedor padre
    event.stopPropagation();

    // mostar confirmacion al usuario
    const confirmDelete = confirm(
    `¿Estás seguro de que quieres eliminar el cuestionario "${questionnaire.title}"?\n\n` +
    'Esta acción no se puede deshacer.'
    );

    // si el usuario confirma, proceder con la elemininacion
    if (confirmDelete) {
      this.questionnaireService.deleteQuestionnaire(questionnaire.id).subscribe({
        next: (response) => {
          // mostrar mensaje de exito
          alert('cuestionario eleminado exitosamente');

          // recargar la lista de cuestionarios
          this.loadQuestionnaires();

          // si el cuestionario eleminado estaba seleccionado, removerlo de la seleccion
          this.selectedQuestionnaires = this.selectedQuestionnaires.filter(
            q => q.id !== questionnaire.id
          );
        },
        error: (error) => {
          //mostrar mensaje de error
          console.error('Error al eliminar cuestionario', error);
          alert('Error al eliminar el cuestionario. Inténtalo de nuevo.');
        }
      });
    }
  }
}

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser, Questionnaire, Cuestionario, Question, Option
from .serializers import QuestionnaireSerializer, QuestionSerializer
 
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    if request.method == 'POST': 
        data = request.data 
        try: 
            if CustomUser.objects.filter(email=data['email']).exists(): 
                return Response({'error': 'Email ya registrado'}, status=status.HTTP_400_BAD_REQUEST) 
            user = CustomUser.objects.create_user( 
                email=data['email'], password=data['password'], 
                first_name=data['first_name'], last_name=data['last_name'] 
            ) 
            return Response({'message': 'Usuario registrado', 'user_id': user.id}, status=status.HTTP_201_CREATED) 
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class QuestionnaireViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionnaireSerializer
    queryset = Questionnaire.objects.all()
    permission_classes = [AllowAny]  # Permitir acceso sin autenticación para testing

    def get_queryset(self):
        # Para testing, devolver todos los cuestionarios si no hay usuario autenticado
        if self.request.user.is_authenticated:
            return Questionnaire.objects.filter(user=self.request.user)
        return Questionnaire.objects.all()

    def perform_create(self, serializer):
        # Para testing, crear un usuario temporal si no hay usuario autenticado
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            # Crear usuario temporal para testing
            temp_user, created = CustomUser.objects.get_or_create(
                email='test@example.com',
                defaults={
                    'first_name': 'Test',
                    'last_name': 'User',
                    'username': 'testuser'
                }
            )
            serializer.save(user=temp_user)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def create_full(self, request):
        # Endpoint para crear cuestionario completo con preguntas y opciones
        data = request.data
        print("Datos recibidos en create_full:", data)  # Debug

        questionnaire_data = {
            'title': data.get('title', 'Cuestionario sin título'),
            'description': data.get('description', ''),
        }

        # Para testing, usar usuario temporal si no hay usuario autenticado
        if request.user.is_authenticated:
            user = request.user
        else:
            user, created = CustomUser.objects.get_or_create(
                email='test@example.com',
                defaults={
                    'first_name': 'Test',
                    'last_name': 'User',
                    'username': 'testuser'
                }
            )

        questionnaire = Questionnaire.objects.create(user=user, **questionnaire_data)

        for question_data in data.get('questions', []):
            question = Question.objects.create(
                questionnaire=questionnaire,
                text=question_data['text'],
                description=question_data.get('description', ''),
                question_type=question_data.get('question_type', question_data.get('type', 'multiple')),
                allow_multiple=question_data.get('allow_multiple', False),
                max_options=question_data.get('max_options', 1)
            )

            for option_data in question_data.get('options', []):
                Option.objects.create(
                    question=question,
                    text=option_data['text'],
                    is_correct=option_data.get('is_correct', False)
                )

        serializer = self.get_serializer(questionnaire)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], permission_classes=[AllowAny])
    def delete_question(self, request, pk=None, question_id=None):
        # Endpoint para eliminar una pregunta de un cuestionario
        questionnaire = self.get_object()

        # Obtener el ID de la pregunta desde la URL
        question_id = request.query_params.get('question_id')
        if not question_id:
            return Response({'error': 'Se requiere question_id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            question = Question.objects.get(id=question_id, questionnaire=questionnaire)
            question.delete()

            serializer = self.get_serializer(questionnaire)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Question.DoesNotExist:
            return Response({'error': 'Pregunta no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def add_question(self, request, pk=None):
        # Endpoint para agregar una pregunta a un cuestionario existente
        questionnaire = self.get_object()
        data = request.data
        print("Datos recibidos en add_question:", data)  # Debug

        # Verificar si es una actualización (si incluye question_id)
        question_id = data.get('question_id')
        if question_id:
            # Actualizar pregunta existente
            try:
                # Buscar la pregunta por ID sin filtrar por questionnaire inicialmente
                question = Question.objects.get(id=question_id)

                # Verificar que la pregunta pertenezca a este cuestionario
                # (ya sea directamente o a través de un sub-cuestionario)
                belongs_to_questionnaire = False
                if question.questionnaire == questionnaire:
                    belongs_to_questionnaire = True
                elif question.cuestionario and question.cuestionario.questionnaire == questionnaire:
                    belongs_to_questionnaire = True

                if not belongs_to_questionnaire:
                    return Response({'error': 'Pregunta no pertenece a este cuestionario'}, status=status.HTTP_403_FORBIDDEN)

                # Actualizar los campos de la pregunta
                question.text = data['text']
                question.description = data.get('description', '')
                question.question_type = data.get('question_type', question.question_type)
                question.allow_multiple = data.get('allow_multiple', question.allow_multiple)
                question.max_options = data.get('max_options', question.max_options)
                question.time = data.get('time')
                question.save()

                # Eliminar opciones existentes y crear nuevas
                question.options.all().delete()  # Eliminar todas las opciones existentes

                for option_data in data.get('options', []):
                    Option.objects.create(
                        question=question,
                        text=option_data['text'],
                        is_correct=option_data.get('is_correct', False)
                    )

                serializer = self.get_serializer(questionnaire)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Question.DoesNotExist:
                return Response({'error': 'Pregunta no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Verificar si se proporciona cuestionario_id
            cuestionario_id = data.get('cuestionario_id')
            cuestionario = None
            if cuestionario_id:
                try:
                    cuestionario = Cuestionario.objects.get(id=cuestionario_id, questionnaire=questionnaire)
                except Cuestionario.DoesNotExist:
                    return Response({'error': 'Cuestionario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            # Crear nueva pregunta
            question = Question.objects.create(
                questionnaire=questionnaire if not cuestionario else None,
                cuestionario=cuestionario,
                text=data['text'],
                description=data.get('description', ''),
                question_type=data.get('question_type', 'multiple'),
                time=data.get('time'),
                allow_multiple=data.get('allow_multiple', False),
                max_options=data.get('max_options', 1)
            )

            for option_data in data.get('options', []):
                Option.objects.create(
                    question=question,
                    text=option_data['text'],
                    is_correct=option_data.get('is_correct', False)
                )

            serializer = self.get_serializer(questionnaire)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def add_cuestionario(self, request, pk=None):
        # Endpoint para agregar un cuestionario a un questionnaire existente
        questionnaire = self.get_object()
        data = request.data
        print("Datos recibidos en add_cuestionario:", data)  # Debug

        name = data.get('name')
        if not name:
            return Response({'error': 'Se requiere name'}, status=status.HTTP_400_BAD_REQUEST)

        cuestionario = Cuestionario.objects.create(
            questionnaire=questionnaire,
            name=name
        )

        serializer = self.get_serializer(questionnaire)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['put'], permission_classes=[AllowAny])
    def update_cuestionario(self, request, pk=None):
        # Endpoint para actualizar un cuestionario
        questionnaire = self.get_object()
        data = request.data
        print("Datos recibidos en update_cuestionario:", data)  # Debug

        cuestionario_id = data.get('cuestionario_id')
        name = data.get('name')
        if not cuestionario_id or not name:
            return Response({'error': 'Se requieren cuestionario_id y name'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cuestionario = Cuestionario.objects.get(id=cuestionario_id, questionnaire=questionnaire)
            cuestionario.name = name
            cuestionario.save()

            serializer = self.get_serializer(questionnaire)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Cuestionario.DoesNotExist:
            return Response({'error': 'Cuestionario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['delete'], permission_classes=[AllowAny])
    def delete_cuestionario(self, request, pk=None):
        # Endpoint para eliminar un cuestionario
        questionnaire = self.get_object()
        cuestionario_id = request.query_params.get('cuestionario_id')
        if not cuestionario_id:
            return Response({'error': 'Se requiere cuestionario_id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cuestionario = Cuestionario.objects.get(id=cuestionario_id, questionnaire=questionnaire)
            cuestionario.delete()

            serializer = self.get_serializer(questionnaire)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Cuestionario.DoesNotExist:
            return Response({'error': 'Cuestionario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def get_cuestionario_questions(self, request, pk=None):
        # Endpoint para obtener las preguntas de un cuestionario específico
        questionnaire = self.get_object()
        cuestionario_id = request.query_params.get('cuestionario_id')
        if not cuestionario_id:
            return Response({'error': 'Se requiere cuestionario_id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cuestionario = Cuestionario.objects.get(id=cuestionario_id, questionnaire=questionnaire)
            questions = Question.objects.filter(cuestionario=cuestionario)
            serializer = QuestionSerializer(questions, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Cuestionario.DoesNotExist:
            return Response({'error': 'Cuestionario no encontrado'}, status=status.HTTP_404_NOT_FOUND)




@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login personalizado que retorna JWT tokens"""
    if request.method == 'POST':
        data = request.data
        try:
            user = CustomUser.objects.get(email=data['email'])
            # Comparar contraseña en texto plano (NO RECOMENDADO PARA PRODUCCIÓN)
            if user.password == data['password']:
                # Crear tokens JWT
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name
                    }
                })
            else:
                return Response({'error': 'Contraseña incorrecta'}, status=status.HTTP_401_UNAUTHORIZED)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login
from .models import CustomUser, Questionnaire, Question, Option
from .serializers import QuestionnaireSerializer
 
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
 
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    if request.method == 'POST':
        data = request.data
        try:
            user = CustomUser.objects.get(email=data['email'])
            # Comparar contraseña en texto plano (NO RECOMENDADO PARA PRODUCCIÓN)
            if user.password == data['password']:
                login(request, user)
                return Response({
                    'message': 'Login exitoso',
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

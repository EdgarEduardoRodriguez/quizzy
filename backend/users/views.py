from rest_framework import status 
from rest_framework.decorators import api_view 
from rest_framework.response import Response 
from django.contrib.auth import authenticate, login 
from .models import CustomUser 
 
@api_view(['POST']) 
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
 
@api_view(['POST']) 
def login_user(request): 
    if request.method == 'POST': 
        data = request.data 
        user = authenticate(email=data['email'], password=data['password']) 
        if user is not None: 
            login(request, user) 
            return Response({ 
                'message': 'Login exitoso', 
                'user': {'id': user.id, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name} 
            }) 
        else: 
            return Response({'error': 'Credenciales invalidas'}, status=status.HTTP_401_UNAUTHORIZED) 

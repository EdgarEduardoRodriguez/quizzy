@echo off
echo Configurando backend Django + MySQL...

REM Instalar Django y dependencias
pip install django djangorestframework mysqlclient django-cors-headers

REM Crear proyecto Django
django-admin startproject quizapp
cd quizapp

REM Crear app de usuarios
python manage.py startapp users

REM Crear archivos de configuración
echo Creando settings.py...
(
echo import os
echo.
echo BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
echo.
echo SECRET_KEY = 'django-insecure-tu-clave-secreta-cambiar-en-produccion'
echo.
echo DEBUG = True
echo.
echo ALLOWED_HOSTS = ['localhost', '127.0.0.1']
echo.
echo INSTALLED_APPS = [
echo     'django.contrib.admin',
echo     'django.contrib.auth',
echo     'django.contrib.contenttypes',
echo     'django.contrib.sessions',
echo     'django.contrib.messages',
echo     'django.contrib.staticfiles',
echo     'rest_framework',
echo     'corsheaders',
echo     'users',
echo ]
echo.
echo MIDDLEWARE = [
echo     'django.middleware.security.SecurityMiddleware',
echo     'django.contrib.sessions.middleware.SessionMiddleware',
echo     'corsheaders.middleware.CorsMiddleware',
echo     'django.middleware.common.CommonMiddleware',
echo     'django.middleware.csrf.CsrfViewMiddleware',
echo     'django.contrib.auth.middleware.AuthenticationMiddleware',
echo     'django.contrib.messages.middleware.MessageMiddleware',
echo     'django.middleware.clickjacking.XFrameOptionsMiddleware',
echo ]
echo.
echo DATABASES = {
echo     'default': {
echo         'ENGINE': 'django.db.backends.mysql',
echo         'NAME': 'quizapp_db',
echo         'USER': 'root',
echo         'PASSWORD': '',
echo         'HOST': 'localhost',
echo         'PORT': '3306',
echo     }
echo }
echo.
echo AUTH_USER_MODEL = 'users.CustomUser'
echo.
echo CORS_ALLOWED_ORIGINS = [
echo     "http://localhost:4200",
echo ]
echo.
echo CORS_ALLOW_CREDENTIALS = True
) > quizapp/settings.py

echo Creando models.py...
(
echo from django.db import models
echo from django.contrib.auth.models import AbstractUser
echo.
echo class CustomUser(AbstractUser):
echo     email = models.EmailField(unique=True)
echo     first_name = models.CharField(max_length=30)
echo     last_name = models.CharField(max_length=30)
echo     created_at = models.DateTimeField(auto_now_add=True)
echo     updated_at = models.DateTimeField(auto_now=True)
echo.
echo     USERNAME_FIELD = 'email'
echo     REQUIRED_FIELDS = ['first_name', 'last_name']
echo.
echo     def __str__(self):
echo         return f"{self.first_name} {self.last_name}"
) > users/models.py

echo Creando views.py...
(
echo from rest_framework import status
echo from rest_framework.decorators import api_view
echo from rest_framework.response import Response
echo from django.contrib.auth import authenticate, login
echo from .models import CustomUser
echo.
echo @api_view(['POST'])
echo def register_user(request):
echo     if request.method == 'POST':
echo         data = request.data
echo         try:
echo             if CustomUser.objects.filter(email=data['email']).exists():
echo                 return Response({
echo                     'error': 'Este email ya está registrado'
echo                 }, status=status.HTTP_400_BAD_REQUEST)
echo.
echo             user = CustomUser.objects.create_user(
echo                 email=data['email'],
echo                 password=data['password'],
echo                 first_name=data['first_name'],
echo                 last_name=data['last_name']
echo             )
echo             return Response({
echo                 'message': 'Usuario registrado exitosamente',
echo                 'user_id': user.id
echo             }, status=status.HTTP_201_CREATED)
echo         except Exception as e:
echo             return Response({
echo                 'error': str(e)
echo             }, status=status.HTTP_400_BAD_REQUEST)
echo.
echo @api_view(['POST'])
echo def login_user(request):
echo     if request.method == 'POST':
echo         data = request.data
echo         user = authenticate(email=data['email'], password=data['password'])
echo.
echo         if user is not None:
echo             login(request, user)
echo             return Response({
echo                 'message': 'Login exitoso',
echo                 'user': {
echo                     'id': user.id,
echo                     'email': user.email,
echo                     'first_name': user.first_name,
echo                     'last_name': user.last_name
echo                 }
echo             })
echo         else:
echo             return Response({
echo                 'error': 'Credenciales inválidas'
echo             }, status=status.HTTP_401_UNAUTHORIZED)
) > users/views.py

echo Creando urls.py para users...
(
echo from django.urls import path
echo from . import views
echo.
echo urlpatterns = [
echo     path('register/', views.register_user, name='register'),
echo     path('login/', views.login_user, name='login'),
echo ]
) > users/urls.py

echo Creando __init__.py...
echo. > users/__init__.py

echo Actualizando quizapp/urls.py...
(
echo from django.contrib import admin
echo from django.urls import path, include
echo.
echo urlpatterns = [
echo     path('admin/', admin.site.urls),
echo     path('api/', include('users.urls')),
echo ]
) > quizapp/urls.py

echo Ejecutando migraciones...
python manage.py makemigrations
python manage.py migrate

echo.
echo ¡Backend Django configurado exitosamente!
echo.
echo Para crear un superusuario, ejecuta:
echo python manage.py createsuperuser
echo.
echo Para iniciar el servidor:
echo python manage.py runserver
echo.
pause

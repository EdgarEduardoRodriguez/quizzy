from django.db import models 
from django.contrib.auth.models import AbstractUser 
 
class CustomUser(AbstractUser): 
    email = models.EmailField(unique=True) 
    first_name = models.CharField(max_length=30) 
    last_name = models.CharField(max_length=30) 
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True) 
 
    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = ['first_name', 'last_name'] 
 
    def __str__(self): 
        return f"{self.first_name} {self.last_name}" 

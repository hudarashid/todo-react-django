from dataclasses import fields
from xml.parsers.expat import model
from rest_framework import serializers
from .models import Task

#serialize the Task model
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
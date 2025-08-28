from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Teacher', 'Teacher'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='Teacher')

class School(models.Model):
    name = models.CharField(max_length=100)
    campus = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.campus})" if self.campus else self.name

class Student(models.Model):
    student_id = models.CharField(max_length=100, unique=True)
    given_name = models.CharField(max_length=100)
    family_name = models.CharField(max_length=100)
    sex = models.CharField(max_length=1, choices=[('M', 'Male'), ('F', 'Female')])
    dob = models.DateField()
    grade = models.CharField(max_length=50, blank=True, null=True)
    major = models.CharField(max_length=100, blank=True, null=True)
    comments = models.TextField(blank=True, null=True)
    enrollment_date = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    photo_url = models.URLField(blank=True, null=True)
    academic_status = models.CharField(max_length=50, blank=True, null=True)
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')

    def __str__(self):
        return f"{self.given_name} {self.family_name}"

class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    date = models.DateField()
    subject = models.CharField(max_length=100)
    score = models.FloatField()

    def __str__(self):
        return f"{self.student} - {self.subject}: {self.score}"

class FollowUp(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='follow_ups')
    date = models.DateTimeField()
    json_data = models.JSONField()
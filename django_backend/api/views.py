from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny
from .models import User, Student
from .serializers import StudentSerializer, UserSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by('family_name', 'given_name')
    serializer_class = StudentSerializer
    # Add permissions later, e.g., IsAuthenticated

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={"input_type":"password"}
    )

    class Meta:
        model = User
        fields = ["id" , "username" ,"email" ,"password"]
        read_only_fields = ["id"]

    def create(self, validate_data):
        return User.objects.create_user(**validate_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=["id", "username", "email", "first_name", "last_name"]
        read_only_fields=fields

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
from django.shortcuts import render
from rest_framework import generics
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer, UserSerializer, LogoutSerializer
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView
# Create your views here.

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class LogoutView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self , request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            token = RefreshToken(serializer.validated_data["refresh"])

            if str(token["user_id"]) != str(request.user.pk):
                return Response(
                    {"detail": "Token does not belong to this user."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token.blacklist()

        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status = status.HTTP_400_BAD_REQUEST
            )

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )
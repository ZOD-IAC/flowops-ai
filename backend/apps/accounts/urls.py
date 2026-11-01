from django.urls import path , include
from .views import RegisterView, CurrentUserView, LogoutView

urlpatterns = [
    path('register/', RegisterView.as_view(), name="register"),
    path('me/', CurrentUserView.as_view(), name="me"),
    path("logout/", LogoutView.as_view(), name="logout")
]

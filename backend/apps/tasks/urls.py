from django.urls import path , include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet

router = DefaultRouter()

router.register(
    r"organizations/(?P<organization_id>\d+)/projects/(?P<project_id>\d+)/tasks",
    TaskViewSet,
    basename="project-tasks"
)

urlpatterns = [
    path("" , include(router.urls)),
]

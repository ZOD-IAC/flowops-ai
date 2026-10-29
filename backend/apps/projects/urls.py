from django.urls import path , include
from rest_framework.routers import DefaultRouter

from .views import ProjectViewsSet

router = DefaultRouter()


router.register(
    r"organizations/(?P<organization_id>\d+)/projects",
    ProjectViewsSet,
    basename="organization-projects"
)

urlpatterns = [
    path("", include(router.urls))   
]

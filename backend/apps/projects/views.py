from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .serializers import ProjectSerializer
from .models import Project
from .permissions import IsOrganizationProjectEditor

from apps.organizations.models import Organization , Membership

# Create your views here.
class ProjectViewsSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsOrganizationProjectEditor]

    def get_organization_membership(self):
        return get_object_or_404(
            Membership.objects.select_related("organization"),
            organization_id=self.kwargs["organization_id"],
            user=self.request.user,
        )

    def get_queryset(self):
        membership = self.get_organization_membership()

        return Project.objects.filter(
            organization=membership.organization
        )

    def perform_create(self, serializer):
        membership = self.get_organization_membership()
        serializer.save(organization=membership.organization)

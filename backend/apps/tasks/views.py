from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.organizations.models import Membership
from apps.projects.models import Project

from .models import Task
from .serializers import TaskSerializer
from .permissions import TaskPermission
from .pagination import TaskPagination
# Create your views here.

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, TaskPermission]
    filter_backends=[
        DjangoFilterBackend, 
        SearchFilter,
        OrderingFilter
    ]
    pagination_class = TaskPagination

    filterset_fields = ["status" , "priority" , "assignee"]
    search_fields = ["title", "description"]
    ordering_fields =["created_at", "due_date", "priority"]
    ordering =["-created_at"]

    def get_membership(self):
        return get_object_or_404(
            Membership, 
            user=self.request.user,
            organization_id = self.kwargs["organization_id"]
        )

    def get_project(self):
        membership =  self.get_membership()

        return get_object_or_404(
            Project,
            id=self.kwargs["project_id"],
            organization = membership.organization
        )

    def get_queryset(self):
        project = self.get_project()

        return Task.objects.filter(
            project=project
        ).select_related("assignee" , "project")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization_id"] = self.kwargs["organization_id"]
        return context

    def perform_create(self, serializer):
        project = self.get_project()
        serializer.save(project=project)

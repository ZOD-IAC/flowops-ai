from rest_framework import serializers
from django.contrib.auth import get_user_model

from apps.organizations.models import Membership
from .models import Task


User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    assignee = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model=Task
        fields=["id", "project", "title", "description", "status", "priority" , "assignee", "due_date" , "created_at" , "updated_at"]
        read_only_fields = ["id" , "project" ,"created_at" , "updated_at"]

    def validate_assignee(self, user):
        if user is None:
            return user

        organization_id = self.context["organization_id"]

        if not Membership.objects.filter(
            organization_id=organization_id,
            user=user
        ).exists():
            raise serializers.ValidationError(
                "Assignee must belong to this organization."
            )

        return user
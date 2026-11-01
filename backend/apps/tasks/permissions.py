from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.organizations.models import Membership

class TaskPermission(BasePermission):
    message =  "You don't have permission to modify this task."

    def has_permission(self, request, view):
        membership = view.get_membership()

        if request.method in SAFE_METHODS:
            return True

        if view.action == "create":
            return membership.role in (
                Membership.Roles.OWNER,
                Membership.Roles.ADMIN
            )

        return True

    def has_object_permission(self, request, view, obj):
        membership = view.get_membership()

        if request.method in SAFE_METHODS:
            return True

        if membership.role in (
            Membership.Roles.OWNER,
            Membership.Roles.ADMIN,
        ):
            return True

        if view.action == "partial_update":
            return (
                obj.assignee_id == request.user.id
                and set(request.data.keys()) == {"status"}
            )
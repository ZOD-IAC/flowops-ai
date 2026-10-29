from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.organizations.models import Membership


class IsOrganizationProjectEditor(BasePermission):
    message = "Only organization owners and admins can modify projects."

    def has_permission(self, request, view):

        if request.method in SAFE_METHODS:
            return True

        membership = view.get_organization_membership()

        return membership.role in (
            Membership.Roles.OWNER, 
            Membership.Roles.ADMIN
        )
        
        return super().has_permission(request, view)
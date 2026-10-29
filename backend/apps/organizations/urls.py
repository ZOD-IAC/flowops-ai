from django.contrib import admin
from django.urls import path
from .views import OrganizationList, OrganizationMembersView, MembershipRoleUpdateView

urlpatterns = [
    path("", OrganizationList.as_view() , name='organization-list'),
    path("<organization_id>/members/",
        OrganizationMembersView.as_view(),
        name='member-list'
    ),
    path("<int:organization_id>/members/<int:user_id>/",
        MembershipRoleUpdateView.as_view(),
        name='member-role-update'
    )
]

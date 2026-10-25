from django.contrib import admin
from django.urls import path
from .views import OrganizationList, OrganizationMembersView

urlpatterns = [
    path("", OrganizationList.as_view() , name='organization-list'),
    path("<organization_id>/members/", OrganizationMembersView.as_view() , name='member-list'),
]

from django.shortcuts import render , get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .services import create_organization
from .models import Organization, Membership
from .serializers import (
    OrganizationSerializer,
    MembershipSerializer,
    MembershipCreateSerializer,
    MembershipRoleUpadateSerializer
)
from .services import add_organization_member


# Create your views here.

class OrganizationList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self , request , *arg , **kwargs):
        organization_ids = Membership.objects.filter(
            user = request.user
        ).values_list("organization_id" ,flat=True)

        organization = Organization.objects.filter(
            id__in=organization_ids
        )

        serializer = OrganizationSerializer(
            organization,
            many=True
        )

        return Response(serializer.data)

    def post(self, request , *arg , **kwargs):
        serializer = OrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        organization = create_organization(
            user = request.user,
            **serializer.validated_data
        )

        response_serializer = OrganizationSerializer(organization)
        return Response(
            response_serializer.data, 
            status=status.HTTP_201_CREATED
        )


class OrganizationMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, organization_id, *args, **kwargs):
        get_object_or_404(Membership , user=request.user , organization_id = organization_id)

        members = Membership.objects.filter(
            organization_id= organization_id
        ).select_related("user")


        serializer = MembershipSerializer(members , many=True)
        return Response(
            serializer.data,
            status.HTTP_200_OK
        )


    def post(self, request, organization_id, *args, **kwargs):
        requester_membership = get_object_or_404(
            Membership,
            user=request.user,
            organization_id=organization_id
        )

        if requester_membership.role not in [
            Membership.Roles.OWNER,
            Membership.Roles.ADMIN,
        ]:
            return Response(
                {"detail": "You do not have permission to add members."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MembershipCreateSerializer(
            data=request.data,
            context={"organization_id": organization_id}
        )
        serializer.is_valid(raise_exception=True)

        membership = add_organization_member(
            organization_id=organization_id,
            **serializer.validated_data
        )

        response_serializer = MembershipSerializer(membership)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )

class MembershipRoleUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self , request , organization_id, user_id , *args, **kwargs):
        requester = get_object_or_404(
            Membership, 
            user= request.user,
            organization_id=organization_id
        )

        if requester.role != Membership.Roles.OWNER:
            return Response(
                {"details":"Only owners can change roles."},
                status=status.HTTP_403_FORBIDDEN
            )

        target= get_object_or_404(
            Membership,
            user_id = user_id,
            organization_id=organization_id,
        )

        if target.Roles == Membership.Roles.OWNER:
            return Response(
                {"details":"Owner roles cannot be modified here."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MembershipRoleUpadateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target.role = serializer.validated_data["role"]
        target.save(update_fields=["role"])


        return Response(
            MembershipSerializer(target).data,
            status=status.HTTP_200_OK
        )

        

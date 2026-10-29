from rest_framework import serializers
from .models import Organization, Membership
from django.contrib.auth import get_user_model

User = get_user_model()

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id" , "name" , "slug" , "created_at"]
        read_only_fields = ["id" , "created_at"]

class MembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source= "user.username",
        read_only = True
    )

    class Meta:
        model= Membership
        fields= ["id" , "user" , "username" , "role", "joined_at"]
        read_only_fields= fields

class MembershipCreateSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset = User.objects.all()
    )

    role = serializers.ChoiceField(
        choices=[
            Membership.Roles.ADMIN,
            Membership.Roles.MEMBER,
        ],
        default=Membership.Roles.MEMBER
    )

    def validate_user(self ,user):
        organization_id = self.context["organization_id"]

        if Membership.objects.filter(
            user = user, 
            organization_id = organization_id,
        ).exists():
            raise serializers.ValidationError(
                "User is already a member of this organization."
            )

        return user

class MembershipRoleUpadateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(
        choices=[
            Membership.Roles.ADMIN,
            Membership.Roles.MEMBER
        ]
    )
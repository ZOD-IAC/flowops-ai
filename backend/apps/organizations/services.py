from django.db import transaction
from .models import Organization, Membership
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

def create_organization(*, user, name, slug):
    with transaction.atomic():
        organization = Organization.objects.create(
            name=name,
            slug=slug
        )

        Membership.objects.create(
            user=user,
            organization=organization,
            role=Membership.Roles.OWNER
        )

    return organization

def add_organization_member(*, organization_id, user, role):
    try:
        return Membership.objects.create(
            organization_id=organization_id,
            user=user,
            role=role
        )
    except IntegrityError as exc:
        if Membership.objects.filter(
            organization_id=organization_id,
            user=user
        ).exists():
            raise ValidationError({
                "user": "User is already a member of this organization."
            }) from exc
        raise

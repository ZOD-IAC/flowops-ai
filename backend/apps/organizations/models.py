from django.db import models
from django.conf import settings;

# Create your models here.

class Organization(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Membership(models.Model):

    class Roles(models.IntegerChoices):
        OWNER = 1, "Owner"
        ADMIN = 2, "Admin"
        MEMBER = 3, "Member"

    user = models.ForeignKey(settings.AUTH_USER_MODEL , on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.IntegerField( choices=Roles.choices ,default=Roles.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints  =[
            models.UniqueConstraint(
                fields=['user' , 'organization'],
                name= 'unique_user_organization'
            )
        ]
        ordering = ["-joined_at"]



from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Organization, Membership


User = get_user_model()


class OrganizationAPITests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="user1" ,  password='TestPass123!')
        self.user2 = User.objects.create_user(username="user2" ,  password='TestPass123!')

        self.organ1 = Organization.objects.create(name='bloom', slug='bloom-1' )
        self.organ2 = Organization.objects.create(name='bloom2', slug='bloom-2' )
        self.organ3 = Organization.objects.create(name='bloom3', slug='bloom-3' )

        Membership.objects.create(user=self.user1, organization=self.organ1, role = Membership.Roles.OWNER)
        Membership.objects.create(user=self.user1, organization=self.organ2, role = Membership.Roles.MEMBER)
        Membership.objects.create(user=self.user2, organization=self.organ2, role = Membership.Roles.OWNER)
        Membership.objects.create(user=self.user2,organization=self.organ3,role=Membership.Roles.OWNER)

    def test_user_can_only_view_own_organizations(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/organization/")

        self.assertEqual(
           response.status_code,
           status.HTTP_200_OK
        )

        returned_id = [
            organization["id"]
            for organization in response.data
        ]

        self.assertIn(self.organ1.id, returned_id)
        self.assertIn(self.organ2.id, returned_id)
        self.assertNotIn(self.organ3.id, returned_id)
        self.assertEqual(len(returned_id), 2)

    def test_unauthenticated_user_cannot_view_organizations(self):
        response = self.client.get("/api/organization/")
        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN
            ]
        )

    def test_user_can_create_organization(self):
        self.client.force_authenticate(user=self.user1)

        organization_name = "Flowops Test 1"
        organization_slug = "flowopes-test-1"
        
        data = {
            "name" : organization_name,
            "slug" : organization_slug
        }

        response = self.client.post("/api/organization/", data, format="json")
        
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        organization = Organization.objects.get(slug = organization_slug)

        self.assertEqual(
            organization.name, 
            organization_name
        )

        membership = Membership.objects.get(
            user=self.user1,
            organization=organization
        )

        self.assertEqual(
            membership.role,
            Membership.Roles.OWNER 

        )

    def test_unauthenticated_user_cannot_create_organizations(self):
        organization_name = "Flowops Test 1"
        organization_slug = "flowopes-test-1"
        
        data = {
            "name" : organization_name,
            "slug" : organization_slug
        }
        
        response = self.client.post("/api/organization/", data=data, format="json")

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN
            ]
        )

    def test_duplicate_slug_is_rejected(self):
        organization_name = "Another Organi"
        organization_slug = self.organ1.slug

        data = {
            "name" : organization_name,
            "slug" : organization_slug
        }

        self.client.force_authenticate(user=self.user1)
        response = self.client.post("/api/organization/", data=data, format="json")


        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertEqual(
            Organization.objects.filter(slug = organization_slug).count(),
            1
        )

    def test_missing_name_is_rejected(self):
        organization_name = ""
        organization_slug = "flowopes-test-2"

        data = {
            "slug" : organization_slug
        }

        self.client.force_authenticate(user=self.user1)
        response = self.client.post("/api/organization/", data=data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertFalse(
            Organization.objects.filter(slug = organization_slug).exists()
        )

    def test_get_member_list(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"/api/organization/{self.organ2.id}/members/")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        returned_user_id = [
            member["user"]
            for member in response.data
        ] 

        self.assertEqual(
            set(returned_user_id),
            {self.user1.id , self.user2.id}
        )

    def test_cannot_view_other_organization_members(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"/api/organization/{self.organ3.id}/members/")

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_unauthenticated_user_cannot_view_members(self):
        response = self.client.get(f"/api/organization/{self.organ3.id}/members/")
        
        self.assertIn(
            response.status_code,
            [ 
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN
            ]
        )

    def test_owner_can_add_member(self):
        new_user = User.objects.create_user(username="new_user")

        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            f"/api/organization/{self.organ1.id}/members/",
            {"user": new_user.id, "role": Membership.Roles.MEMBER},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Membership.objects.filter(
                user=new_user,
                organization=self.organ1,
                role=Membership.Roles.MEMBER
            ).exists()
        )


    def test_admin_can_add_member(self):
        admin_user = User.objects.create_user(username="admin")
        new_user = User.objects.create_user(username="new_user")

        Membership.objects.create(
            user=admin_user,
            organization=self.organ1,
            role=Membership.Roles.ADMIN
        )

        self.client.force_authenticate(user=admin_user)
        response = self.client.post(
            f"/api/organization/{self.organ1.id}/members/",
            {"user": new_user.id, "role": Membership.Roles.MEMBER},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    def test_member_cannot_add_member(self):
        new_user = User.objects.create_user(username="new_user")

        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            f"/api/organization/{self.organ2.id}/members/",
            {"user": new_user.id, "role": Membership.Roles.MEMBER},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


    def test_non_member_cannot_add_member(self):
        new_user = User.objects.create_user(username="new_user")

        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            f"/api/organization/{self.organ3.id}/members/",
            {"user": new_user.id, "role": Membership.Roles.MEMBER},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


    def test_duplicate_membership_is_rejected(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            f"/api/organization/{self.organ1.id}/members/",
            {"user": self.user1.id, "role": Membership.Roles.MEMBER},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_cannot_assign_owner_role(self):
        new_user = User.objects.create_user(username="new_user")

        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            f"/api/organization/{self.organ1.id}/members/",
            {"user": new_user.id, "role": Membership.Roles.OWNER},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_invalid_user_id_is_rejected(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            f"/api/organization/{self.organ1.id}/members/",
            {"user": 999999, "role": Membership.Roles.MEMBER},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_OWNER_promote_member_to_ADMIN(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            f"/api/organization/{self.organ1.id}/members/",
            {"user": 999999, "role": Membership.Roles.MEMBER},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)



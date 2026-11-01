from django.db import models
from django.conf import settings
# Create your models here.


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = "TODO" , "To Do"
        IN_PROGRESS = "IN_PROGRESS" , "In Progress"
        Done = "DONE" , "Done"

    class Priority(models.IntegerChoices):
        LOW = 1, "Low"
        MEDIUM = 2, "Medium"
        HIGH = 3, "High"

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO
    )

    priority = models.IntegerField(
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )

    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_task",
    )

    due_date = models.DateField(blank=True, null=True)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

    def __str__(self):
        return self.title
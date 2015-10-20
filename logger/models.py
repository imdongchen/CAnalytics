from django.db import models
from datetime import datetime
import json

from django.contrib.auth.models import User, Group
from workspace.models import Case, Entity, Relationship
import sync


# Create your models here.
class Action(models.Model):
    user = models.ForeignKey(User, null=True, blank=True)
    operation = models.CharField(max_length=200)
    # the object the action is performed on,
    # can be an annotation, entity, relationship, etc.
    item = models.CharField(max_length=50, null=True, blank=True)
    tool = models.CharField(max_length=50, null=True, blank=True)
    data = models.TextField(null=True, blank=True)  # json format
    time = models.DateTimeField(default=datetime.now)
    # whether the activity should be seen by user or only for research
    public = models.NullBooleanField(null=True, blank=True)
    case = models.ForeignKey(Case)
    group = models.ForeignKey(Group)

    # class Meta:
    #     ordering = ['-time']

    def __unicode__(self):
        return (self.user.username + ' ' + self.operation
               + ' ' + self.item)

    def serialize(self):
        return {
            'id': self.id,
            'user': self.user.id,
            'operation': self.operation,
            'item': self.item,
            'tool': self.tool,
            'data': json.loads(self.data),
            'public': self.public,
            'group': self.group.id,
            'case': self.case.id,
            'time': self.time.strftime('%m/%d/%Y-%H:%M:%S'),
        }

    def save(self, *args, **kwargs):
        # automatically send activity logs that are public
        # to all users in the group
        data = self.serialize()
        if self.public:
            sync.views.broadcast_activity(data, self.case, self.group, self.user)

        if self.item == 'entity':
            d = json.loads(self.data)
            try:
                ent = Entity.objects.get(id=d['id'])
            except:
                pass
            else:
                DoEntity.objects.create(user=self.user, operation=self.operation,entity=ent,tool=self.tool,data=self.data,time=self.time,public=self.public,case=self.case, group=self.group)
        elif self.item == 'relationship':
            d = json.loads(self.data)
            try:
                rel = Relationship.objects.get(id=d['id'])
            except:
                pass
            else:
                DoRelationship.objects.create(user=self.user, operation=self.operation,relationship=rel,tool=self.tool,data=self.data,time=self.time,public=self.public,case=self.case, group=self.group)
        elif self.item == 'entities':
            ds = json.loads(self.data)
            for d in ds:
                try:
                    ent = Entity.objects.get(id=d['meta']['id'])
                except:
                    pass
                else:
                    DoEntity.objects.create(user=self.user, operation=self.operation,entity=ent,tool=self.tool,data=self.data,time=self.time,public=self.public,case=self.case, group=self.group)
        elif self.item == 'relationships':
            ds = json.loads(self.data)
            for d in ds:
                try:
                    rel = Relationship.objects.get(id=d['id'])
                except:
                    pass
                else:
                    DoRelationship.objects.create(user=self.user, operation=self.operation,relationship=rel,tool=self.tool,data=self.data,time=self.time,public=self.public,case=self.case, group=self.group)

        super(Action, self).save(*args, **kwargs)


class DoEntity(models.Model):
    user = models.ForeignKey(User, null=True, blank=True)
    operation = models.CharField(max_length=200)
    entity = models.ForeignKey(Entity)
    tool = models.CharField(max_length=50, null=True, blank=True)
    data = models.TextField(null=True, blank=True)  # json format
    time = models.DateTimeField(default=datetime.now)
    public = models.NullBooleanField(null=True, blank=True)
    case = models.ForeignKey(Case)
    group = models.ForeignKey(Group)

    def __unicode__(self):
        return (self.time.strftime('%m/%d/%Y-%H:%M:%S') + ' ' + self.user.username + ' ' + self.operation
               + ' ' + self.entity.name)


class DoRelationship(models.Model):
    user = models.ForeignKey(User, null=True, blank=True)
    operation = models.CharField(max_length=200)
    relationship = models.ForeignKey(Relationship)
    tool = models.CharField(max_length=50, null=True, blank=True)
    data = models.TextField(null=True, blank=True)  # json format
    time = models.DateTimeField(default=datetime.now)
    case = models.ForeignKey(Case)
    group = models.ForeignKey(Group)
    public = models.NullBooleanField(null=True, blank=True)

    def __unicode__(self):
        return (self.time.strftime('%m/%d/%Y-%H:%M:%S') + ' ' + self.user.username + ' ' + self.operation
               + ' ' + self.relationship.__unicode__())


from marshmallow import fields
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from .models import Comment, Event, Listing, User


class BaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        load_instance = True
        include_relationships = True
        include_fk = True

    created_at = fields.DateTime(dump_only=True)


class UserSchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = User
        exclude = ("password_hash",)


class ListingSchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = Listing

    owner = fields.Nested(UserSchema, only=("id", "full_name", "email", "role"))
    price = fields.Float()


class EventSchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = Event

    creator = fields.Nested(UserSchema, only=("id", "full_name", "email", "role"))
    start_time = fields.DateTime()


class CommentSchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = Comment

    author = fields.Nested(UserSchema, only=("id", "full_name", "email"))
    listing = fields.Nested(ListingSchema, only=("id", "title"), allow_none=True)
    event = fields.Nested(EventSchema, only=("id", "title"), allow_none=True)


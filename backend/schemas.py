import os
from marshmallow import fields, post_dump
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


def convert_photo_urls(photos, base_url=None):
    """Convert relative photo URLs to absolute URLs"""
    if not photos:
        return []
    if not base_url:
        # Try to get backend URL from environment
        base_url = os.getenv('BACKEND_URL')
        if not base_url:
            # Fallback: try Railway's public domain
            railway_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN')
            if railway_domain:
                base_url = f"https://{railway_domain}"
            else:
                base_url = 'http://localhost:5000'
        base_url = base_url.rstrip('/')
    
    result = []
    for photo in photos:
        if photo and photo.startswith('/'):
            result.append(f"{base_url}{photo}")
        elif photo:
            result.append(photo)
    return result


class ListingSchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = Listing

    owner = fields.Nested(UserSchema, only=("id", "full_name", "email", "role"))
    price = fields.Float()
    
    @post_dump
    def convert_photos(self, data, **kwargs):
        """Convert photo URLs to absolute URLs"""
        if 'photos' in data and data['photos']:
            # Try to get backend URL from environment, or construct from request
            base_url = os.getenv('BACKEND_URL')
            if not base_url:
                # Fallback: try to get from RAILWAY_PUBLIC_DOMAIN or construct default
                railway_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN')
                if railway_domain:
                    base_url = f"https://{railway_domain}"
                else:
                    base_url = 'http://localhost:5000'
            base_url = base_url.rstrip('/')
            data['photos'] = convert_photo_urls(data['photos'], base_url)
        return data


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


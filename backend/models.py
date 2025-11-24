from sqlalchemy import JSON, func

from .database import bcrypt, db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(50), nullable=False, default="student")
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)

    listings = db.relationship("Listing", foreign_keys="Listing.owner_id", back_populates="owner", cascade="all, delete")
    events = db.relationship("Event", back_populates="creator", cascade="all, delete")
    comments = db.relationship("Comment", back_populates="author", cascade="all, delete")

    def set_password(self, password: str) -> None:
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, password)


class Listing(db.Model):
    __tablename__ = "listings"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(150), nullable=False)
    contact = db.Column(db.String(120), nullable=False)
    photos = db.Column(JSON, nullable=False, default=list)
    verified = db.Column(db.Boolean, default=False, nullable=False)
    verified_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)

    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    owner = db.relationship("User", foreign_keys=[owner_id], back_populates="listings")
    verified_by = db.relationship("User", foreign_keys=[verified_by_id])

    comments = db.relationship("Comment", back_populates="listing", cascade="all, delete")


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(150), nullable=False)
    iframe_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)

    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    creator = db.relationship("User", back_populates="events")

    comments = db.relationship("Comment", back_populates="event", cascade="all, delete")


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    listing_id = db.Column(db.Integer, db.ForeignKey("listings.id"), nullable=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=True)

    author = db.relationship("User", back_populates="comments")
    listing = db.relationship("Listing", back_populates="comments")
    event = db.relationship("Event", back_populates="comments")


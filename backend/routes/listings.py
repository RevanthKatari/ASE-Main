import os
from http import HTTPStatus
from werkzeug.utils import secure_filename

from flask import Blueprint, jsonify, request, current_app

from ..database import db
from ..models import Listing, User
from ..schemas import ListingSchema

listings_bp = Blueprint("listings", __name__)
listing_schema = ListingSchema()
listing_list_schema = ListingSchema(many=True)


@listings_bp.get("/")
def list_listings():
    listings = Listing.query.order_by(Listing.created_at.desc()).all()
    return jsonify(listing_list_schema.dump(listings)), HTTPStatus.OK


@listings_bp.post("/")
def create_listing():
    payload = request.get_json() or {}

    required_fields = {
        "title": payload.get("title"),
        "description": payload.get("description"),
        "price": payload.get("price"),
        "location": payload.get("location"),
        "contact": payload.get("contact"),
        "owner_id": payload.get("owner_id"),
    }
    missing = [name for name, value in required_fields.items() if value in (None, "")]
    if missing:
        return (
            jsonify({"error": f"Missing required fields: {', '.join(missing)}"}),
            HTTPStatus.BAD_REQUEST,
        )

    owner = db.session.get(User, required_fields["owner_id"])
    if not owner:
        return jsonify({"error": "Owner not found"}), HTTPStatus.NOT_FOUND

    # Handle photos if provided
    photos = payload.get("photos", [])
    if not isinstance(photos, list):
        photos = [photos] if photos else []

    listing = Listing(
        title=required_fields["title"],
        description=required_fields["description"],
        price=required_fields["price"],
        location=required_fields["location"],
        contact=required_fields["contact"],
        photos=photos,
        verified=bool(payload.get("verified", False)),
        owner=owner,
    )

    db.session.add(listing)
    db.session.commit()

    return jsonify(listing_schema.dump(listing)), HTTPStatus.CREATED


@listings_bp.patch("/<int:listing_id>/verify")
def verify_listing(listing_id):
    """Allow helpers to verify listings"""
    payload = request.get_json() or {}
    helper_id = payload.get("helper_id")
    
    if not helper_id:
        return jsonify({"error": "helper_id is required"}), HTTPStatus.BAD_REQUEST
    
    helper = db.session.get(User, helper_id)
    if not helper:
        return jsonify({"error": "Helper not found"}), HTTPStatus.NOT_FOUND
    
    # Check if user has helper role
    if helper.role == "student":
        return jsonify({"error": "Only helpers can verify listings"}), HTTPStatus.FORBIDDEN
    
    listing = db.session.get(Listing, listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), HTTPStatus.NOT_FOUND
    
    listing.verified = True
    listing.verified_by_id = helper_id
    db.session.commit()
    
    return jsonify(listing_schema.dump(listing)), HTTPStatus.OK


@listings_bp.post("/upload-photo")
def upload_photo():
    """Handle photo uploads and return the URL"""
    if "photo" not in request.files:
        return jsonify({"error": "No photo provided"}), HTTPStatus.BAD_REQUEST
    
    file = request.files["photo"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), HTTPStatus.BAD_REQUEST
    
    # Validate file type
    allowed_extensions = {"png", "jpg", "jpeg", "gif", "webp"}
    filename = secure_filename(file.filename)
    if not ("." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions):
        return jsonify({"error": "Invalid file type. Allowed: png, jpg, jpeg, gif, webp"}), HTTPStatus.BAD_REQUEST
    
    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join(current_app.root_path, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save with unique name
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{timestamp}_{filename}"
    file_path = os.path.join(upload_dir, unique_filename)
    file.save(file_path)
    
    # Return URL
    photo_url = f"/uploads/{unique_filename}"
    return jsonify({"url": photo_url}), HTTPStatus.CREATED


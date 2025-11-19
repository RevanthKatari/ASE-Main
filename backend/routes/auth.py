from http import HTTPStatus

from flask import Blueprint, jsonify, request

from ..database import db
from ..models import User
from ..schemas import UserSchema

auth_bp = Blueprint("auth", __name__)
user_schema = UserSchema()


@auth_bp.post("/register")
def register():
    payload = request.get_json() or {}
    full_name = payload.get("full_name")
    email = (payload.get("email") or "").lower().strip()
    password = payload.get("password")
    role = payload.get("role", "student")

    missing_fields = [
        field
        for field, value in (("full_name", full_name), ("email", email), ("password", password))
        if not value
    ]
    if missing_fields:
        return (
            jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}),
            HTTPStatus.BAD_REQUEST,
        )

    if User.query.filter_by(email=email).first():
        return (
            jsonify({"error": "Email already registered"}),
            HTTPStatus.CONFLICT,
        )

    user = User(full_name=full_name, email=email, role=role)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify(user_schema.dump(user)), HTTPStatus.CREATED


@auth_bp.post("/login")
def login():
    payload = request.get_json() or {}
    email = (payload.get("email") or "").lower().strip()
    password = payload.get("password")

    if not email or not password:
        return (
            jsonify({"error": "Email and password are required"}),
            HTTPStatus.BAD_REQUEST,
        )

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return (
            jsonify({"error": "Invalid email or password"}),
            HTTPStatus.UNAUTHORIZED,
        )

    return jsonify(user_schema.dump(user)), HTTPStatus.OK


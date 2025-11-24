from datetime import datetime, timedelta, timezone

from .database import db
from .models import Event, Listing, User


def seed():
    """Seed initial data. Safe to run multiple times - checks if data exists first.
    Must be called within an app context (from app.py or with app.app_context()).
    """
    # Check if helper user already exists
    existing_helper = User.query.filter_by(email="helper@windsorhub.ca").first()
    if existing_helper:
        print("ℹ️  Helper account already exists. Skipping seed.")
        return

    helper = User(full_name="Community Helper", email="helper@windsorhub.ca", role="helper")
    helper.set_password("Password123!")

        student = User(full_name="International Student", email="student@windsorhub.ca", role="student")
        student.set_password("Password123!")

        db.session.add_all([helper, student])
        db.session.flush()

        listing = Listing(
            title="Room near Downtown",
            description="Private room in shared apartment, utilities included.",
            price=650,
            location="Downtown Windsor",
            contact="helper@windsorhub.ca",
            photos=["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
            verified=True,
            verified_by_id=helper.id,
            owner=helper,
        )
        
        unverified_listing = Listing(
            title="Cozy Studio Apartment",
            description="Perfect for students. Close to university campus with easy access to public transit.",
            price=850,
            location="Near University",
            contact="student@windsorhub.ca",
            photos=["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
            verified=False,
            owner=student,
        )

        event = Event(
            title="Community Potluck",
            description="Monthly gathering for newcomers and residents.",
            start_time=datetime.now(timezone.utc) + timedelta(days=7),
            location="Windsor Community Centre",
            iframe_url="https://lu.ma/embed/event/evt-QJWboYkaiUk1mDE/simple",
            creator=helper,
        )
        
        event2 = Event(
            title="Newcomer Orientation Workshop",
            description="Learn about local services, transit, and community resources.",
            start_time=datetime.now(timezone.utc) + timedelta(days=14),
            location="Windsor Public Library",
            iframe_url=None,
            creator=helper,
        )

        db.session.add_all([listing, unverified_listing, event, event2])
        db.session.commit()

        print("✅ Seed data created successfully.")
        print("   Helper account: helper@windsorhub.ca / Password123!")
        print("   Student account: student@windsorhub.ca / Password123!")


if __name__ == "__main__":
    seed()


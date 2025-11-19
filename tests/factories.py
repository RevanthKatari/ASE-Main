from faker import Faker


fake = Faker()


def user_payload(**overrides):
    payload = {
        "full_name": fake.name(),
        "email": fake.unique.email(),
        "password": "Password123!",
        "role": "student",
    }
    payload.update(overrides)
    return payload


def listing_payload(owner_id, **overrides):
    payload = {
        "title": fake.sentence(nb_words=4),
        "description": fake.paragraph(),
        "price": round(fake.pyfloat(left_digits=3, right_digits=2, positive=True), 2),
        "location": fake.city(),
        "contact": fake.email(),
        "owner_id": owner_id,
        "verified": True,
    }
    payload.update(overrides)
    return payload


def event_payload(created_by_id, start_time, **overrides):
    payload = {
        "title": fake.sentence(nb_words=3),
        "description": fake.paragraph(nb_sentences=2),
        "start_time": start_time,
        "location": fake.address().replace("\n", ", "),
        "created_by_id": created_by_id,
    }
    payload.update(overrides)
    return payload


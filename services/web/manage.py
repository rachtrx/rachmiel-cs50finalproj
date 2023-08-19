import os

from project import create_app, db
from project.asset.models import Admin
from flask_bcrypt import generate_password_hash

app = create_app()

@app.cli.command("create_db")
def create_db():
    db.create_all()
    db.session.commit()


@app.cli.command("remove_db")
def remove_db():
    db.drop_all()
    db.session.commit()


@app.cli.command("seed_db")
def seed_db():
    db.session.add(Admin(email=os.getenv('APP_EMAIL'),
                         pwd=generate_password_hash(os.getenv('APP_PASSWORD')).decode('utf8'),
                         username=os.getenv('APP_USERNAME')))
    db.session.commit()


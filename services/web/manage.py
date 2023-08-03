from project import create_app
from flask.cli import FlaskGroup
from project import db

app = create_app()

cli = FlaskGroup(app)


@cli.command("create_db")
def create_db():
    db.drop_all()
    db.create_all()
    db.session.commit()


@cli.command("remove_db")
def remove_db():
    db.drop_all()
    db.session.commit()
# can add another cli.command seed_db


if __name__ == "__main__":
    cli()

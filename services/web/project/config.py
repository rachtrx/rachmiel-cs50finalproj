import os

basedir = os.path.abspath(os.path.dirname(__file__))
print(basedir)


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')

    # Database
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL") or 'sqlite:///' + os.path.join(basedir, 'inventory.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STATIC_FOLDER = f"{os.getenv('APP_FOLDER')}/project/static"
    UPLOADS_FOLDER = f"{os.getenv('APP_FOLDER')}/project/uploads"
    ALLOWED_EXTENSIONS = {'pdf', 'xlsx', 'xls'}

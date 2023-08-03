import os

basedir = os.path.abspath(os.path.dirname(__file__))
print(basedir)


class Config:
    SECRET_KEY = b'G\x82\xa9*\x00\xe8]\xa3\xc7\x82\xec\xe9\xbf8L\xf0'

    # Database
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL") or 'sqlite:///' + os.path.join(basedir, 'inventory.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STATIC_FOLDER = f"{os.getenv('APP_FOLDER')}/project/static"
    UPLOADS_FOLDER = f"{os.getenv('APP_FOLDER')}/project/uploads"
    ALLOWED_EXTENSIONS = {'pdf', 'xlsx', 'xls'}

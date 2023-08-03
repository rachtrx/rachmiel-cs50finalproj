import os
from flask import Flask, redirect, url_for, send_from_directory

from .config import Config
from project.extensions import db, migrate


def create_app(config_class=Config):
    app = Flask(__name__)

    app.config.from_object(config_class)

    # os.makedirs(f"{os.getenv('APP_FOLDER')}/project/uploads", exist_ok=True)

    # Initialize Flask extensions here
    db.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints here
    from project.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from project.asset import bp as asset_bp
    app.register_blueprint(asset_bp, url_prefix='/asset')

    @app.route("/")
    def home_view():
        print('hello')
        return redirect(url_for('asset.forms.onboard_devices'))

    @app.route('/static/<path:filename>')
    def serve_static(filename):
        return send_from_directory(app.config["STATIC_FOLDER"], filename)

    return app

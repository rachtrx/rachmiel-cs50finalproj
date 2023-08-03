from flask import render_template, request, jsonify, redirect, url_for
from project.asset.views import bp
from project.extensions import db
from project.asset.models import Device, Model, User, Event, Vendor, DeviceType, Dept
from sqlalchemy import desc, exists, distinct, func


@bp.route('/devices')
def devices_view():
    _device_types = db.session.query(DeviceType.device_type).all()
    _vendors = db.session.query(Vendor.vendor_name).all()
    _locations = db.session.query(Device.location).distinct().all()
    _ages = db.session.query(
        func.floor((func.extract('epoch', func.now() - Device.registered_date) / 31556952)).label('device_age')
    ).order_by(
        func.floor(func.extract('epoch', func.now() - Device.registered_date) / 31556952).asc()
    ).distinct().all()

    print(_ages)

    device_types = [row[0] for row in _device_types]
    vendors = [row[0] for row in _vendors]
    locations = [row[0] for row in _locations]
    ages = sorted([row[0] for row in _ages])

    print(ages)

    return render_template("/views/devices.html", device_types=device_types, vendors=vendors, locations=locations, ages=ages)


@bp.route('/history', methods=["GET"])
def history_view():

    _device_types = db.session.query(DeviceType.device_type).all()

    print(_device_types)

    device_types = [row[0] for row in _device_types]

    return render_template("/views/history.html", device_types=device_types)


@bp.route('/show_device', methods=["GET", "POST"])
def show_device():
    if request.method == "GET":
        return render_template("/views/show_device.html")
    else:
        data = request.get_json()
        device_id, action = data

        if action == 'add':
            device = db.session.query(Device).filter(
                Device.id == device_id).first()
            if device:
                device.bookmarked = 1
                db.session.commit()
                return jsonify({"message": "Bookmark updated successfully"})
            else:
                return jsonify({"error": "Device not found"}), 400
        else:
            device = db.session.query(Device).filter(
                Device.id == device_id).first()
            if device:
                device.bookmarked = 0
                db.session.commit()
                return jsonify({"message": "Bookmark updated successfully"})
            else:
                return jsonify({"error": "Device not found"}), 400


@bp.route('/users')
def users_view():
    if request.method == "GET":

        _depts = db.session.query(Dept.dept_name).distinct().all()

        depts = [row[0] for row in _depts]

        return render_template("/views/users.html", depts=depts)


@bp.route('/show_user', methods=["POST", "GET"])
def show_user():
    if request.method == "GET":
        return render_template("/views/show_user.html")
    else:
        data = request.get_json()
        user_id, action = data
        user = User.query.get(user_id)

        if user:
            if action == 'add':
                user.bookmarked = 1
            else:
                user.bookmarked = 0

            db.session.commit()
            return jsonify({"message": "Bookmark updated successfully"})
        else:
            return jsonify({"message": "User not found"})

# SECTION VIEWS

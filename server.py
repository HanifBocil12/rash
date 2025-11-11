# from flask import Flask, jsonify, request
# import os

# app = Flask(__name__)

# STATE = {"flag": "IDLE"}

# @app.route("/", methods=["GET"])
# def home():
#     return jsonify({"message": "Railway Flask aktif", "flag": STATE["flag"]})

# @app.route("/state", methods=["GET"])
# def get_state():
#     return jsonify(STATE)

# @app.route("/trigger", methods=["POST"])
# def trigger():
#     STATE["flag"] = "RUN"
#     return jsonify({"status": "success", "flag": "RUN"})

# @app.route("/reset", methods=["POST"])
# def reset():
#     STATE["flag"] = "IDLE"
#     return jsonify({"status": "success", "flag": "IDLE"})

# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 8080))
#     app.run(host="0.0.0.0", port=port)

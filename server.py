from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Simpan status agent di memori
STATE = {"flag": "IDLE"}

@app.route("/trigger", methods=["POST"])
def trigger():
    """Dipanggil oleh Streamlit UI untuk memulai agent"""
    STATE["flag"] = "RUN"
    return jsonify({"status": "success", "message": "Agent akan dijalankan", "flag": STATE["flag"]})

@app.route("/state", methods=["GET"])
def state():
    """Dibaca oleh agent lokal untuk tahu apakah perlu jalan"""
    return jsonify(STATE)

@app.route("/reset", methods=["POST"])
def reset():
    """Dipanggil oleh agent lokal setelah selesai"""
    STATE["flag"] = "IDLE"
    return jsonify({"status": "success", "flag": STATE["flag"]})

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Railway Agent API aktif", "flag": STATE["flag"]})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)

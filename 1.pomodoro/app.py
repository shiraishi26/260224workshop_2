from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

# Timer state
TIMER_STATE = {
    "running": False,
    "time_left": 0
}

# Add settings storage
SETTINGS = {
    "work_time": 25,
    "short_break": 5,
    "long_break": 15,
    "cycles": 4
}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/start", methods=["POST"])
def start_timer():
    data = request.json
    TIMER_STATE["running"] = True
    TIMER_STATE["time_left"] = data.get("time", 25 * 60)  # Default to 25 minutes
    return jsonify({"message": "Timer started", "state": TIMER_STATE})

@app.route("/stop", methods=["POST"])
def stop_timer():
    TIMER_STATE["running"] = False
    return jsonify({"message": "Timer stopped", "state": TIMER_STATE})

@app.route("/reset", methods=["POST"])
def reset_timer():
    TIMER_STATE["running"] = False
    TIMER_STATE["time_left"] = 0
    return jsonify({"message": "Timer reset", "state": TIMER_STATE})

@app.route("/state", methods=["GET"])
def get_state():
    return jsonify(TIMER_STATE)

@app.route("/settings", methods=["GET", "POST"])
def settings():
    if request.method == "POST":
        data = request.json
        SETTINGS.update({
            "work_time": data.get("work_time", SETTINGS["work_time"]),
            "short_break": data.get("short_break", SETTINGS["short_break"]),
            "long_break": data.get("long_break", SETTINGS["long_break"]),
            "cycles": data.get("cycles", SETTINGS["cycles"]),
        })
        return jsonify({"message": "Settings updated", "settings": SETTINGS})
    return jsonify(SETTINGS)

if __name__ == "__main__":
    app.run(debug=True)

import json

from flask import Flask, get_template_attribute, render_template, request
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

path = "E:/Steam/steamapps/common/Beat Saber/UserData/BeatSaberPlus/ChatRequest/SimpleQueue.txt"


@app.route("/queue", methods=["GET"])
@cross_origin()
def getUpdatedQueue():
    with open(path, "r") as f:
        dat = json.load(f)
        serverQueue = "&".join(sorted(s["song"]["key"] for s in dat))
        clientQueue = request.args.get("current")
        if serverQueue == clientQueue:
            return "NO CHANGE"

        return get_template_attribute("queue.html", "getQueue")(dat)


app.run(port=5050)

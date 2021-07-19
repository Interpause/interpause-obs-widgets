from flask import Flask, render_template, get_template_attribute
from flask_cors import CORS, cross_origin
import json

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

path = "E:/Steam/steamapps/common/Beat Saber/UserData/SRM/SongRequestQueue.dat"

@app.route('/',methods=['GET'])
def getQueueApp():
    with open(path,'r') as f:
        dat = json.load(f)
        return render_template('queue.html',songs = dat)

@app.route('/queue',methods=['GET'])
@cross_origin()
def getUpdatedQueue():
    with open(path,'r') as f:
        dat = json.load(f)
        return get_template_attribute('queue.html','getQueue')(dat)
        
app.run(port=5050)

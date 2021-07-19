from flask import Flask, render_template, get_template_attribute, request
from flask_cors import CORS, cross_origin
import json

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

path = "E:/Steam/steamapps/common/Beat Saber/UserData/SRM/SongRequestQueue.dat"

@app.route('/queue',methods=['GET'])
@cross_origin()
def getUpdatedQueue():
    with open(path,'r') as f:
        dat = json.load(f)
        serverQueue = '&'.join(sorted(s['song']['key'] for s in dat))
        clientQueue = request.args.get('current')
        if(serverQueue == clientQueue): return 'NO CHANGE'

        return get_template_attribute('queue.html','getQueue')(dat)
        
app.run(port=5050)

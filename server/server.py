import time
from datetime import datetime

from flask_socketio import send, emit
from flask import Flask, render_template
from flask_cors import CORS
from flask_socketio import SocketIO
from kubernetes import config
from kubernetes.client import Configuration
from kubernetes.client.api import core_v1_api
from kubernetes.client.rest import ApiException
from kubernetes.stream import stream


app = Flask(__name__)
cors = CORS(app,resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app, cors_allowed_origins='*')


@socketio.on('connect')
def test_connect():
    print('***** connected *****')


@socketio.on('disconnect')
def test_disconnect():
    print('client disconnected')


@socketio.on('message')
def handle_message(message):
    print('handle message')
    emit('message', message)


@socketio.on('hello!')
def handle_hello(*args):
    print('***** handle_hello *****')
    print(args)
    emit('message', datetime.utcnow().isoformat())


@socketio.on('want_interval')
def handle_want_interval():
    while True:
        time.sleep(1)
        emit('message', f'interval: {datetime.utcnow().isoformat()}')


if __name__ == '__main__':
    config.load_kube_config()
    c = Configuration()
    c.assert_hostname = False
    Configuration.set_default(c)
    core_v1 = core_v1_api.CoreV1Api()
    socketio.run(app, host='0.0.0.0', debug=True, port=30000)

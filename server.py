import os
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

pod_name = os.environ.get('POD_NAME')
if not pod_name:
    raise RuntimeError(f"POD_NAME is required")


app = Flask(__name__)
cors = CORS(app,resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app, cors_allowed_origins='*')

config.load_kube_config()
core_v1 = core_v1_api.CoreV1Api()


@socketio.on('connect')
def test_connect():
    print('connected')


@socketio.on('disconnect')
def test_disconnect():
    print('client disconnected')


@socketio.on('message')
def handle_message(message):
    print(f'handle message, {message}')
    exec_command = [
        '/bin/bash',
        '-c',
        message
    ]
    name = 'nginx-f89759699-2tv5w'
    resp = stream(
        core_v1.connect_get_namespaced_pod_exec,
        name,
        'default',
        command=exec_command,
        stderr=True,
        stdin=False,
        stdout=True,
        tty=False,
    )
    print("Response: " + resp)
    emit('message', resp)


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', debug=True, port=30000)

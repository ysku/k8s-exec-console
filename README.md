Kubernetes Exec Console w/ Proxy
=================================

Run kubernetes cluster locally.

```bash
$ minikube start --vm-driver=hyperkit
```

```bash
$ kubectl run --restart=Never busybox --image=busybox sleep infinity
```

Run web server and api server respectively.

```bash
$ pip install -r requirements.txt
$ POD_NAME=nginx-f89759699-2tv5w python server.py

$ yarn
$ yarn run start
```

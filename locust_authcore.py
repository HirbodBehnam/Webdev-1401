from locust import HttpUser, task
import random
import string

def random_string() -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))

class AuthCore(HttpUser):
    host = "http://127.0.0.1:8000"
    user = random_string()
    password = random_string()

    def on_start(self):
        # Register a new user
        self.client.post("/auth/signup", data={
            "email": self.user,
            "password": self.password,
            "phone": random_string(),
            "first_name": random_string(),
            "second_name": random_string(),
            "gender": "m",
        })

    @task
    def login(self):
        self.client.post("/auth/login", data={
            "email": self.user,
            "password": self.password,
        })

    @task
    def logout(self):
        response = self.client.post("/auth/login", data={
            "email": self.user,
            "password": self.password,
        })
        if response.status_code != 200:
            return
        json_response = response.json()
        self.client.post("/auth/logout", headers={
            "Authorization": "Bearer " + json_response['access_token']
        })

    @task
    def refresh(self):
        response = self.client.post("/auth/login", data={
            "email": self.user,
            "password": self.password,
        })
        if response.status_code != 200:
            return
        json_response = response.json()
        self.client.get("/auth/refresh?refresh_token=" + json_response['refresh_token'])

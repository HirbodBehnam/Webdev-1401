import random
from locust import HttpUser, task

class Ticket(HttpUser):
    host = "http://127.0.0.1:8000"
    bank_url = "http://0.0.0.0:5050"
    email = "a1@gmail.com"
    password = "1234"

    @task
    def flight_search(self):
        self.client.get("/ticket/flights?origin=VNS&destination=EWR&departureDate=2023-02-14")

    # @task
    # def purchase_history(self):
        # self.client.get("/ticket/purchases", headers={
            # "Authorization": "Bearer XKUNLB5KDHWUAPGZ6KMEWUTNJM======"
        # })

    @task
    def purchase(self):
        login_result = self.client.post("/auth/login", data={"email": self.email, "password": self.password})
        if not login_result.ok:
            return
        bearer_token = login_result.json()["access_token"]
        flight_serial = random.randint(1, 500000)
        flight_class = random.choice(["y", "j", "f"])
        with self.client.post("/ticket/purchase", json={"flightSerial": flight_serial, "flightClass": flight_class}, headers={"Authorization": f"Bearer {bearer_token}"}, catch_response=True) as purchase_result:
            if purchase_result.text in ["too late bitch!", "flight not available!"]:
                purchase_result.success()
                return
            elif not purchase_result.ok:
                purchase_result.failure(purchase_result.text)
                return
            transaction_id = purchase_result.url.split("/")[-2]
            transaction_result = 1
            payment_page_url = f"{self.bank_url}/payed/{transaction_id}/{transaction_result}"
            self.client.get(payment_page_url, name="payment_callback")
        

from locust import HttpUser, task

class Ticket(HttpUser):
    host = "http://127.0.0.1:8000"

    @task
    def flight_search(self):
        self.client.get("/ticket/flights?origin=VNS&destination=EWR&departureDate=2023-02-14")

    @task
    def purchase_history(self):
        self.client.get("/ticket/purchases", headers={
            "Authorization": "Bearer XKUNLB5KDHWUAPGZ6KMEWUTNJM======"
        })

import time
from locust import HttpUser, task, between


class AlokaiLoad(HttpUser):
    wait_time = between(2, 5)
    def on_start(self):
        """ on_start is called when a Locust start before any task is scheduled """
        self.client.verify = False
    # http://pre-www.motionrc.com/

    @task(20)
    def product_list_1(self):
        self.client.get(f"http://{self.host}/collections/rc-jets")

    @task(20)
    def home(self):
        self.client.get(f"http://{self.host}/")

    @task(20)
    def product_page_1(self):
        self.client.get(f"http://{self.host}/products/freewing-l-15-jl-10-falcon-6s-64mm-edf-jet-pnp-fj11313p")

    @task(20)
    def product_list_2(self):
        self.client.get(f"http://{self.host}/collections/beginner-and-trainer-rc-airplanes")

    @task(20)
    def product_page_2(self):
        self.client.get(f"http://{self.host}/products/nexa-dhc-2-beaver-whistler-air-1620mm-arf-nxa1065-002")

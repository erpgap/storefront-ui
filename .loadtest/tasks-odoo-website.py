import time
from locust import HttpUser, task, between

class AlokaiLoad(HttpUser):
    wait_time = between(2, 5)
    def on_start(self):
        """ on_start is called when a Locust start before any task is scheduled """
        self.client.verify = False
    # http://pre-www.motionrc.com/

    @task(20)
    def home(self):
        self.client.get(f"http://{self.host}/")

    @task(20)
    def product_page_1(self):
        self.client.get(f"http://{self.host}/product/leather-jacket-d-r-o-w-s-black-96?Size=189&Material=188&Color=191")

    @task(20)
    def product_list(self):
        self.client.get(f"http://{self.host}/category/15")


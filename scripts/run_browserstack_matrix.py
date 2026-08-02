import base64
import json
import os
import sys
import time
from pathlib import Path

import requests

hub = "https://hub-cloud.browserstack.com/wd/hub"
user = os.environ["BROWSERSTACK_USERNAME"]
key = os.environ["BROWSERSTACK_ACCESS_KEY"]
site = "https://prod-dev.ems-fitus.cloud"
email = "nphlinh23@clc.fitus.edu.vn"
password = "Test@123"


def request(method, path, body=None):
    response = requests.request(method, f"{hub}{path}", auth=(user, key), json=body, timeout=90)
    response.raise_for_status()
    return response.json()["value"]


def wait_for_url(session, expected):
    for _ in range(30):
        if request("GET", f"/session/{session}/url") == expected:
            return
        time.sleep(1)
    raise RuntimeError(f"Timed out waiting for {expected}")


def element(session, selector):
    value = request("POST", f"/session/{session}/element", {"using": "css selector", "value": selector})
    return value["element-6066-11e4-a52e-4f735466cecf"]


def capture(name, capabilities, path, scroll_bottom=False):
    session = request("POST", "/session", {"capabilities": {"alwaysMatch": capabilities}})["sessionId"]
    try:
        request("POST", f"/session/{session}/url", {"url": site})
        wait_for_url(session, f"{site}/login?callbackUrl=%2F")
        for selector, value in [("input[type='email']", email), ("input[type='password']", password)]:
            element_id = element(session, selector)
            request("POST", f"/session/{session}/element/{element_id}/value", {"text": value})
        button = element(session, "button[type='submit']")
        request("POST", f"/session/{session}/element/{button}/click")
        wait_for_url(session, f"{site}/dashboard")
        request("POST", f"/session/{session}/url", {"url": f"{site}{path}"})
        time.sleep(3)
        if scroll_bottom:
            request("POST", f"/session/{session}/execute/sync", {"script": "window.scrollTo(0, document.body.scrollHeight)", "args": []})
            time.sleep(1)
        screenshot = request("GET", f"/session/{session}/screenshot")
        output = Path("evidence/task3") / f"{name}.png"
        output.write_bytes(base64.b64decode(screenshot))
        print(json.dumps({"name": name, "status": "Pass", "session": session, "url": f"{site}{path}"}))
    except Exception as error:
        print(json.dumps({"name": name, "status": "Blocked", "error": str(error)}))
    finally:
        requests.delete(f"{hub}/session/{session}", auth=(user, key), timeout=30)


matrix = {
    "win_chrome": {"browserName": "Chrome", "browserVersion": "latest", "bstack:options": {"os": "Windows", "osVersion": "11", "sessionName": "HW03 Chrome"}},
    "mac_firefox": {"browserName": "Firefox", "browserVersion": "latest", "bstack:options": {"os": "OS X", "osVersion": "Sonoma", "sessionName": "HW03 Firefox"}},
    "mac_opera": {"browserName": "Opera", "browserVersion": "latest", "bstack:options": {"os": "OS X", "osVersion": "Sonoma", "sessionName": "HW03 Opera"}},
    "ipad_safari": {"browserName": "iPhone", "bstack:options": {"deviceName": "iPad 9th", "osVersion": "15", "realMobile": True, "sessionName": "HW03 Safari iPad"}},
    "android_samsung": {"browserName": "Samsung Internet", "bstack:options": {"deviceName": "Samsung Galaxy S23", "osVersion": "13.0", "realMobile": True, "sessionName": "HW03 Samsung Internet"}},
}

screens = {"b1": ("/dashboard", False), "b2": ("/events/68", False), "b3": ("/events/68", True)}

for screen, (path, scroll_bottom) in screens.items():
    for browser, capabilities in matrix.items():
        capture(f"{screen}_{browser}", capabilities, path, scroll_bottom)

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from app import app

class TestPomodoroApp(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_start_timer(self):
        response = self.app.post('/start', json={"time": 1500})
        self.assertEqual(response.status_code, 200)
        self.assertIn("Timer started", response.get_json()["message"])

    def test_stop_timer(self):
        response = self.app.post('/stop')
        self.assertEqual(response.status_code, 200)
        self.assertIn("Timer stopped", response.get_json()["message"])

    def test_reset_timer(self):
        response = self.app.post('/reset')
        self.assertEqual(response.status_code, 200)
        self.assertIn("Timer reset", response.get_json()["message"])

    def test_get_state(self):
        response = self.app.get('/state')
        self.assertEqual(response.status_code, 200)
        self.assertIn("running", response.get_json())
        self.assertIn("time_left", response.get_json())

if __name__ == "__main__":
    unittest.main()
import time
import urllib.request
import json
import random
import datetime
import threading
import sys

API_URL = "http://127.0.0.1:8001/api/wokwi/telemetry"

class WokwiTelemetryStreamer:
    def __init__(self):
        self.base_weight = 5.00
        self.mode = "NORMAL"          # NORMAL | ALTERNATE | LOCKED
        self.tamper_locked = False
        self.auto_cycle = False
        self.running = True
        self.packet_count = 0

    def trigger_tamper(self):
        self.mode = "ALTERNATE"
        self.tamper_locked = False
        print("\n💥 >>> [SIMULATOR ACTION] +20% LOAD CELL TAMPERING TRIGGERED! <<<\n")

    def trigger_lock(self):
        self.mode = "LOCKED"
        self.tamper_locked = True
        print("\n🔒 >>> [SIMULATOR ACTION] EMERGENCY MACHINE LOCKOUT TRIGGERED! <<<\n")

    def reset_normal(self):
        self.mode = "NORMAL"
        self.tamper_locked = False
        print("\n✅ >>> [SIMULATOR ACTION] RESTORED TO NORMAL LEGAL CALIBRATION <<<\n")

    def auto_cycle_worker(self):
        """Automatically cycles states for an autonomous dynamic demo."""
        while self.running:
            # 1. Normal Operation for 18 seconds (6 packets)
            self.reset_normal()
            time.sleep(18)
            if not self.auto_cycle or not self.running:
                break

            # 2. Tampering (+20% Yellow Button Alter) for 15 seconds
            self.trigger_tamper()
            time.sleep(15)
            if not self.auto_cycle or not self.running:
                break

            # 3. Quarantined Lockout for 12 seconds
            self.trigger_lock()
            time.sleep(12)
            if not self.auto_cycle or not self.running:
                break

    def run_stream(self):
        print("=" * 68)
        print("  🛡️  WOKWI ESP32 LIVE TELEMETRY & TAMPERING ATTACK SIMULATOR")
        print(f"  Target Backend : {API_URL}")
        print("=" * 68)
        print("  Controls on Frontend Dashboard (http://localhost:5173):")
        print("   👉 Click [Toggle +20% Alter] to simulate load cell bypass attack")
        print("   👉 Click [Trigger Lock] to simulate machine lockdown")
        print("   👉 Click [Reset Normal] to recover legal metrology trust\n")
        print("Streaming real-time telemetry packets to BiLSTM model...\n")

        while self.running:
            try:
                self.packet_count += 1
                noise = round(random.uniform(-0.02, 0.02), 2)
                actual_weight = round(self.base_weight + noise, 2)

                if self.mode == "ALTERNATE":
                    displayed_weight = round(actual_weight * 1.20, 2)
                elif self.mode == "LOCKED":
                    displayed_weight = actual_weight
                    self.tamper_locked = True
                else:
                    displayed_weight = actual_weight
                    self.tamper_locked = False

                now = datetime.datetime.now()
                rtc_time = now.strftime("%H:%M:%S")

                payload = {
                    "edge_id": "WEIGH-ESP32-01",
                    "sensor_id": "HX711-LC01",
                    "ip_address": "192.168.1.101",
                    "hop_level": 1,
                    "actual_weight": actual_weight,
                    "displayed_weight": displayed_weight,
                    "mode": self.mode,
                    "tamper_locked": self.tamper_locked,
                    "rtc_time": rtc_time
                }

                data_bytes = json.dumps(payload).encode('utf-8')
                req = urllib.request.Request(API_URL, data=data_bytes, headers={'Content-Type': 'application/json'})
                with urllib.request.urlopen(req, timeout=3) as resp:
                    if resp.status == 200:
                        eval_data = json.loads(resp.read().decode('utf-8')).get("evaluation", {})
                        trust_score = eval_data.get('overall_trust_score', 0.0)
                        trust_class = eval_data.get('trust_class', 'UNKNOWN')
                        risk = eval_data.get('attack_risk', 'N/A')
                        state = eval_data.get('comm_state', 'ALLOWED')

                        status_icon = "🟢" if trust_class == "TRUSTED" else ("🟡" if trust_class == "SUSPICIOUS" else "🔴")
                        print(f"[{rtc_time}] #{self.packet_count:03d} {status_icon} Actual={actual_weight}kg | Disp={displayed_weight}kg ({self.mode:9s}) | Trust={trust_score:.2f} [{trust_class:10s}] | Risk={risk:14s} | State={state}")
            except Exception as e:
                # Backend may be briefly syncing
                pass

            time.sleep(2.5)

if __name__ == "__main__":
    streamer = WokwiTelemetryStreamer()
    # Check if user passed --auto flag
    if "--auto" in sys.argv:
        streamer.auto_cycle = True
        t = threading.Thread(target=streamer.auto_cycle_worker, daemon=True)
        t.start()
        print("🔄 [AUTO-DEMO MODE ENABLED]: Cycling Normal -> Tampered -> Locked automatically every ~15 seconds.\n")

    try:
        streamer.run_stream()
    except KeyboardInterrupt:
        streamer.running = False
        print("\n🛑 Telemetry stream stopped.")

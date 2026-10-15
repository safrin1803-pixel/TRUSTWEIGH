"""
=============================================================================
  BLYNK IOT CLOUD -> TRUSTWEIGH DASHBOARD LIVE BRIDGE RUNNER
  Department of Legal Metrology Enforcement - Tampering Detection System
=============================================================================
This script polls live sensor telemetry from Blynk IoT Cloud (ESP32 / Wokwi)
and streams it directly into the BiLSTM Trust Evaluation Engine & Dashboard.
"""

import sys
import time
import json
import urllib.request
import urllib.error
import datetime

# =============================================================================
# CONFIGURATION: Enter your Blynk Cloud Details below
# =============================================================================
BLYNK_AUTH_TOKEN = "YOUR_BLYNK_AUTH_TOKEN_HERE"  # Replace with your Blynk Device Auth Token
BLYNK_SERVER = "https://blynk.cloud"            # Default Blynk Cloud Server

# Virtual Pin Mapping on your ESP32 Blynk code:
# e.g., V0 = Weight, V1 = Mode (0: NORMAL, 1: ALTERNATE), V2 = Lock Status
PIN_ACTUAL_WEIGHT = "v0"       # Actual Weight from HX711 Load Cell
PIN_DISPLAYED_WEIGHT = "v1"    # Weight shown on Scale LCD/7-Segment
PIN_MODE = "v2"                # Mode (NORMAL / ALTERNATE / 0 / 1)
PIN_LOCK = "v3"                # Tamper Lock (0: Unlocked, 1: Locked)

# Local TrustWeigh Dashboard Backend API
DASHBOARD_API_URL = "http://127.0.0.1:8001/api/wokwi/telemetry"
POLL_INTERVAL_SECONDS = 2.0     # Poll every 2 seconds
# =============================================================================


def fetch_blynk_pin_value(token: str, pin: str, server: str = BLYNK_SERVER) -> str:
    """Fetch value of a specific virtual pin from Blynk Cloud REST API."""
    url = f"{server}/external/api/get?token={token}&{pin.lower()}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "TrustWeigh-Blynk-Bridge/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                return response.read().decode("utf-8").strip().strip('"')
    except urllib.error.HTTPError as e:
        if e.code == 400:
            # Token invalid or pin not initialized
            return None
    except Exception:
        pass
    return None


def fetch_all_blynk_telemetry(token: str):
    """Fetch all configured virtual pins from Blynk Cloud."""
    val_w = fetch_blynk_pin_value(token, PIN_ACTUAL_WEIGHT)
    val_disp = fetch_blynk_pin_value(token, PIN_DISPLAYED_WEIGHT)
    val_mode = fetch_blynk_pin_value(token, PIN_MODE)
    val_lock = fetch_blynk_pin_value(token, PIN_LOCK)

    # Defaults / Conversions
    try:
        actual_weight = float(val_w) if val_w is not None else 5.00
    except ValueError:
        actual_weight = 5.00

    # Mode processing
    mode_str = "NORMAL"
    if val_mode is not None:
        if str(val_mode).upper() in ["1", "ALTERNATE", "TAMPERED", "TRUE"]:
            mode_str = "ALTERNATE"
        else:
            mode_str = "NORMAL"

    # Displayed weight
    try:
        if val_disp is not None and val_disp != "":
            displayed_weight = float(val_disp)
        else:
            displayed_weight = round(actual_weight * 1.20, 2) if mode_str == "ALTERNATE" else actual_weight
    except ValueError:
        displayed_weight = actual_weight

    # Lock processing
    tamper_locked = False
    if val_lock is not None and str(val_lock).upper() in ["1", "TRUE", "LOCKED"]:
        tamper_locked = True
        mode_str = "LOCKED"

    return {
        "actual_weight": actual_weight,
        "displayed_weight": displayed_weight,
        "mode": mode_str,
        "tamper_locked": tamper_locked
    }


def send_to_trustweigh_dashboard(telemetry: dict):
    """Posts telemetry to TrustWeigh BiLSTM Backend."""
    now = datetime.datetime.now()
    rtc_time = now.strftime("%H:%M:%S")

    payload = {
        "edge_id": "WEIGH-ESP32-01",
        "sensor_id": "HX711-LC01",
        "ip_address": "192.168.1.101",
        "hop_level": 1,
        "actual_weight": telemetry["actual_weight"],
        "displayed_weight": telemetry["displayed_weight"],
        "mode": telemetry["mode"],
        "tamper_locked": telemetry["tamper_locked"],
        "rtc_time": rtc_time
    }

    try:
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            DASHBOARD_API_URL,
            data=data_bytes,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status == 200:
                result = json.loads(resp.read().decode("utf-8"))
                return result.get("evaluation", {})
    except Exception as e:
        return {"error": str(e)}
    return None


def run_bridge(token: str):
    print("=" * 65)
    print("  🛡️  TRUSTWEIGH - BLYNK CLOUD LIVE TELEMETRY BRIDGE")
    print(f"  Target Backend : {DASHBOARD_API_URL}")
    print(f"  Blynk Server   : {BLYNK_SERVER}")
    print(f"  Auth Token     : {token[:6]}******{token[-4:] if len(token) > 10 else ''}")
    print(f"  Virtual Pins   : Weight={PIN_ACTUAL_WEIGHT}, Disp={PIN_DISPLAYED_WEIGHT}, Mode={PIN_MODE}, Lock={PIN_LOCK}")
    print("=" * 65)
    print("Streaming live telemetry from Blynk Cloud to Dashboard... (Press Ctrl+C to stop)\n")

    count = 0
    while True:
        count += 1
        now_str = datetime.datetime.now().strftime("%H:%M:%S")
        telemetry = fetch_all_blynk_telemetry(token)

        eval_res = send_to_trustweigh_dashboard(telemetry)

        if eval_res and "error" not in eval_res:
            trust_score = eval_res.get("overall_trust_score", 0.0)
            trust_class = eval_res.get("trust_class", "UNKNOWN")
            risk = eval_res.get("attack_risk", "N/A")
            comm = eval_res.get("comm_state", "ALLOWED")

            status_icon = "🟢" if trust_class == "TRUSTED" else ("🟡" if trust_class == "SUSPICIOUS" else "🔴")
            print(f"[{now_str}] #{count:03d} {status_icon} Weight: {telemetry['actual_weight']}kg (Disp: {telemetry['displayed_weight']}kg) | Mode: {telemetry['mode']} | Trust: {trust_score:.2f} [{trust_class}] | Risk: {risk} | State: {comm}")
        else:
            err_msg = eval_res.get("error") if eval_res else "Backend unreachable"
            print(f"[{now_str}] #{count:03d} ⚠️ Blynk Read: Weight={telemetry['actual_weight']}kg | Dashboard sync issue: {err_msg}")

        time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    # Check if Token passed via command line argument or use default
    auth_token = BLYNK_AUTH_TOKEN
    if len(sys.argv) > 1:
        auth_token = sys.argv[1]

    if auth_token == "YOUR_BLYNK_AUTH_TOKEN_HERE" or not auth_token:
        print("\n" + "=" * 60)
        print("  🔑 BLYNK AUTH TOKEN REQUIRED")
        print("=" * 60)
        user_input = input("Enter your Blynk Device Auth Token: ").strip()
        if user_input:
            auth_token = user_input
        else:
            print("❌ No token provided. Exiting.")
            sys.exit(1)

    try:
        run_bridge(auth_token)
    except KeyboardInterrupt:
        print("\n\n🛑 Blynk Live Bridge stopped by user.")

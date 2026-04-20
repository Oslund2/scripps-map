"""Fetch FCC full-power TV station data for all US states using curl."""
import subprocess
import sys
import time

STATES = [
    "AL","AZ","AR","CA","CO","CT","DC","FL","GA","HI",
    "ID","IL","IN","IA","KS","KY","LA","MA","MD","MI",
    "MN","MO","MS","MT","NE","NV","NH","NJ","NM","NY",
    "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN",
    "TX","UT","VA","WA","WI","WV","WY"
]

BASE_URL = "https://transition.fcc.gov/fcc-bin/tvq?list=4&state={state}&serv=DT&status=L&type=4&LastAction=Search"

stations = {}  # callsign -> formatted line
errors = []

def parse_station_line(line):
    """Parse a single pipe-delimited station line from FCC data."""
    parts = [p.strip() for p in line.split("|")]
    # Each record line starts with empty field (leading |), then fields
    # Field indices (0-based after split, field 0 is empty before first |):
    # 1: callsign, 4: channel, 9: status(LIC/STA), 10: city, 11: state
    # 19: lat_dir(N/S), 20: lat_deg, 21: lat_min, 22: lat_sec
    # 23: lon_dir(E/W), 24: lon_deg, 25: lon_min, 26: lon_sec
    # 27: licensee
    if len(parts) < 28:
        return None

    callsign = parts[1].strip()
    channel = parts[4].strip()
    status = parts[9].strip()
    city = parts[10].strip()
    state = parts[11].strip()

    # Validate
    if not callsign or not channel or not city:
        return None
    if state not in STATES and state != "DC":
        return None

    # Parse lat/lon from DMS
    try:
        lat_dir = parts[19].strip()
        lat_deg = float(parts[20].strip())
        lat_min = float(parts[21].strip())
        lat_sec = float(parts[22].strip())
        lon_dir = parts[23].strip()
        lon_deg = float(parts[24].strip())
        lon_min = float(parts[25].strip())
        lon_sec = float(parts[26].strip())

        lat = lat_deg + lat_min/60 + lat_sec/3600
        if lat_dir == "S":
            lat = -lat
        lon = lon_deg + lon_min/60 + lon_sec/3600
        if lon_dir == "W":
            lon = -lon

        lat_str = f"{lat:.6f}"
        lon_str = f"{lon:.6f}"
    except (ValueError, IndexError):
        lat_str = ""
        lon_str = ""

    licensee = parts[27].strip() if len(parts) > 27 else ""

    return {
        "callsign": callsign,
        "channel": channel,
        "city": city,
        "state": state,
        "licensee": licensee,
        "lat": lat_str,
        "lon": lon_str,
        "status": status
    }


def fetch_state(state, attempt=1):
    """Fetch station data for a single state using curl."""
    url = BASE_URL.format(state=state)
    try:
        result = subprocess.run(
            ["curl", "-s", "-m", "60", "-A", "Mozilla/5.0", url],
            capture_output=True, text=True, timeout=90
        )
        if result.returncode != 0:
            return None, f"curl returned {result.returncode}"
        return result.stdout, None
    except subprocess.TimeoutExpired:
        return None, "timeout"
    except Exception as e:
        return None, str(e)


for i, state in enumerate(STATES):
    print(f"[{i+1}/{len(STATES)}] Fetching {state}...", end=" ", flush=True)

    html, err = fetch_state(state)
    if err:
        print(f"ERROR: {err}")
        errors.append(state)
        time.sleep(1)
        continue

    count = 0
    for line in html.split("\n"):
        line = line.strip()
        if not line or not line.startswith("|"):
            continue

        rec = parse_station_line(line)
        if rec is None:
            continue

        cs = rec["callsign"]
        # Deduplicate: prefer LIC over STA
        if cs in stations:
            # If existing is STA and new is LIC, replace
            if stations[cs]["status"] == "STA" and rec["status"] == "LIC":
                stations[cs] = rec
                # don't increment count, it's a replacement
            # otherwise skip
        else:
            stations[cs] = rec
            count += 1

    print(f"{count} new stations (total: {len(stations)})")

    # Brief pause to be polite
    if i < len(STATES) - 1:
        time.sleep(0.3)

# Retry errors
if errors:
    print(f"\nRetrying {len(errors)} failed states: {errors}")
    for state in list(errors):
        print(f"  Retrying {state}...", end=" ", flush=True)
        time.sleep(2)
        html, err = fetch_state(state, attempt=2)
        if err:
            print(f"FAILED AGAIN: {err}")
            continue

        errors.remove(state)
        count = 0
        for line in html.split("\n"):
            line = line.strip()
            if not line or not line.startswith("|"):
                continue
            rec = parse_station_line(line)
            if rec is None:
                continue
            cs = rec["callsign"]
            if cs not in stations:
                stations[cs] = rec
                count += 1
            elif stations[cs]["status"] == "STA" and rec["status"] == "LIC":
                stations[cs] = rec
        print(f"{count} new stations (total: {len(stations)})")

# Write output
outfile = "fcc_stations.txt"
with open(outfile, "w", encoding="utf-8") as f:
    f.write("callsign|channel|city|state|licensee|lat|lon\n")
    for cs in sorted(stations.keys()):
        s = stations[cs]
        f.write(f"{s['callsign']}|{s['channel']}|{s['city']}|{s['state']}|{s['licensee']}|{s['lat']}|{s['lon']}\n")

print(f"\nDone. {len(stations)} unique stations written to {outfile}")
if errors:
    print(f"WARNING: Failed states: {errors}")

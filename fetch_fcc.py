"""Fetch FCC full-power TV station data for all US states."""
import urllib.request
import re
import time
import sys

STATES = [
    "AL","AZ","AR","CA","CO","CT","DC","FL","GA","HI",
    "ID","IL","IN","IA","KS","KY","LA","MA","MD","MI",
    "MN","MO","MS","MT","NE","NV","NH","NJ","NM","NY",
    "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN",
    "TX","UT","VA","WA","WI","WV","WY"
]

BASE_URL = "https://transition.fcc.gov/fcc-bin/tvq?list=4&state={state}&serv=DT&status=L&type=4&LastAction=Search"

stations = {}  # callsign -> line
errors = []

for i, state in enumerate(STATES):
    url = BASE_URL.format(state=state)
    print(f"[{i+1}/{len(STATES)}] Fetching {state}...", end=" ", flush=True)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8", errors="replace")

        # The FCC page returns HTML with <pre> blocks containing pipe-delimited data
        # Look for lines that match station pattern: fields separated by |
        # Each station line has pipe-separated fields
        count = 0
        for line in raw.split("\n"):
            # Strip HTML tags
            clean = re.sub(r'<[^>]+>', '', line).strip()
            if not clean:
                continue
            parts = [p.strip() for p in clean.split("|")]
            # We expect at least 7-8 fields: callsign|channel|city|state|blank|licensee|lat|lon
            if len(parts) >= 7:
                callsign = parts[0].strip()
                channel = parts[1].strip()
                city = parts[2].strip()
                st = parts[3].strip()
                licensee = parts[5].strip() if len(parts) > 5 else ""
                lat = parts[6].strip() if len(parts) > 6 else ""
                lon = parts[7].strip() if len(parts) > 7 else ""

                # Validate: callsign should look like a call sign (letters/digits, 3-8 chars)
                # channel should be numeric, state should be 2 letters
                if (re.match(r'^[A-Z0-9\-]{3,10}$', callsign)
                    and re.match(r'^\d+', channel)
                    and re.match(r'^[A-Z]{2}$', st)):
                    if callsign not in stations:
                        stations[callsign] = f"{callsign}|{channel}|{city}|{st}|{licensee}|{lat}|{lon}"
                        count += 1
        print(f"{count} new stations (total: {len(stations)})")
    except Exception as e:
        print(f"ERROR: {e}")
        errors.append(state)

    # Small delay to be polite
    if i < len(STATES) - 1:
        time.sleep(0.5)

# Retry errors once
if errors:
    print(f"\nRetrying {len(errors)} failed states: {errors}")
    for state in errors:
        url = BASE_URL.format(state=state)
        print(f"  Retrying {state}...", end=" ", flush=True)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
            count = 0
            for line in raw.split("\n"):
                clean = re.sub(r'<[^>]+>', '', line).strip()
                if not clean:
                    continue
                parts = [p.strip() for p in clean.split("|")]
                if len(parts) >= 7:
                    callsign = parts[0].strip()
                    channel = parts[1].strip()
                    city = parts[2].strip()
                    st = parts[3].strip()
                    licensee = parts[5].strip() if len(parts) > 5 else ""
                    lat = parts[6].strip() if len(parts) > 6 else ""
                    lon = parts[7].strip() if len(parts) > 7 else ""
                    if (re.match(r'^[A-Z0-9\-]{3,10}$', callsign)
                        and re.match(r'^\d+', channel)
                        and re.match(r'^[A-Z]{2}$', st)):
                        if callsign not in stations:
                            stations[callsign] = f"{callsign}|{channel}|{city}|{st}|{licensee}|{lat}|{lon}"
                            count += 1
            print(f"{count} new stations")
        except Exception as e:
            print(f"FAILED AGAIN: {e}")
        time.sleep(0.5)

# Write output
outfile = "fcc_stations.txt"
with open(outfile, "w", encoding="utf-8") as f:
    f.write("callsign|channel|city|state|licensee|lat|lon\n")
    for cs in sorted(stations.keys()):
        f.write(stations[cs] + "\n")

print(f"\nDone. {len(stations)} unique stations written to {outfile}")

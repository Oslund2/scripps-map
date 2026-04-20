"""Load FCC stations into Supabase. Reads fcc_stations.txt, maps owners, generates SQL batches."""
import re, os, json

# Owner group mapping patterns (order matters - first match wins)
OWNER_PATTERNS = [
    (r"nexstar|tribune|mission broadcasting|white knight", "Nexstar"),
    (r"sinclair|cunningham|deerfield", "Sinclair"),
    (r"gray television|raycom|quincy|meredith", "Gray"),
    (r"tegna", "Tegna"),
    (r"hearst", "Hearst"),
    (r"scripps", "Scripps"),
    (r"inyo", "INYO"),
    (r"ion television|ion media", "ION"),
    (r"fox television stations", "Fox O&O"),
    (r"cbs broadcasting", "CBS O&O"),
    (r"nbc telemundo|nbcuniversal|nbc subsidiaries", "NBC O&O"),
    (r"abc holding|disney general", "ABC O&O"),
    (r"univision", "Univision"),
    (r"entravision", "Entravision"),
    (r"cox media|cox television", "Cox"),
    (r"graham media", "Graham"),
    (r"hubbard", "Hubbard"),
    (r"allen media", "Allen Media"),
    (r"weigel", "Weigel"),
    (r"block commun", "Block"),
    (r"bahakel", "Bahakel"),
    (r"saga commun", "Saga"),
    (r"lilly broadcasting", "Lilly"),
    (r"morgan murphy", "Morgan Murphy"),
    (r"griffin", "Griffin"),
    (r"bonneville", "Bonneville"),
    (r"lockwood", "Lockwood"),
    (r"berkshire hathaway|post-newsweek", "Berkshire Hathaway"),
    (r"emmis", "Emmis"),
    (r"journal broadcast|journal commun", "Journal"),
    (r"townsquare", "Townsquare"),
    (r"quincy|schurz", "Other"),
    (r"public broadcast|educational|university|state board|board of regents|community tv|state of|commonwealth", "Public/PBS"),
    (r"religious|faith|christian|daystar|trinity|tbn|cornerstone|lesea|worship|word of god|pax|dominion|cornerstone|dayspring|three angels", "Religious"),
]

def map_owner(licensee):
    if not licensee:
        return "Other"
    for pat, group in OWNER_PATTERNS:
        if re.search(pat, licensee, re.IGNORECASE):
            return group
    return "Other"

def esc(v):
    if not v:
        return "NULL"
    return "'" + v.replace("'", "''") + "'"

# Read FCC data
stations = []
with open("fcc_stations.txt", "r", encoding="utf-8") as f:
    header = f.readline()
    for line in f:
        parts = line.strip().split("|")
        if len(parts) < 7:
            continue
        callsign, channel, city, state, licensee, lat, lon = parts[:7]
        if not callsign or callsign == "-" or not lat or not lon:
            continue
        try:
            lat_f = float(lat)
            lon_f = float(lon)
        except ValueError:
            continue

        owner = map_owner(licensee)
        is_scripps = owner == "Scripps"
        is_inyo = owner == "INYO"

        # Generate facility_id hash
        h = 0
        for c in (callsign + city + state):
            h = ((h << 5) - h + ord(c)) & 0xFFFFFFFF
        fid = (h % 900000) + 100000

        stations.append({
            "fid": fid,
            "callsign": callsign,
            "channel": int(channel) if channel.isdigit() else None,
            "city": city.title(),
            "state": state,
            "lat": lat_f,
            "lon": lon_f,
            "licensee": licensee,
            "owner": owner,
            "is_scripps": is_scripps,
            "is_inyo": is_inyo,
        })

print(f"Parsed {len(stations)} stations")

# Deduplicate by callsign (keep first)
seen = {}
unique = []
for s in stations:
    if s["callsign"] not in seen:
        seen[s["callsign"]] = True
        unique.append(s)
stations = unique
print(f"After dedup: {len(stations)} unique stations")

# Owner group stats
owners = {}
for s in stations:
    owners[s["owner"]] = owners.get(s["owner"], 0) + 1
for g, c in sorted(owners.items(), key=lambda x: -x[1]):
    print(f"  {g}: {c}")

# Generate SQL batches
BATCH = 100
batch_num = 0
for i in range(0, len(stations), BATCH):
    batch = stations[i:i+BATCH]
    batch_num += 1
    fname = f"fcc_sql_batch_{batch_num}.sql"

    vals = []
    for s in batch:
        v = f"({s['fid']},{esc(s['callsign'])},{s['channel'] or 'NULL'},{esc(s['city'])},{esc(s['state'])},{s['lat']:.6f},{s['lon']:.6f},NULL,{esc(s['owner'])},NULL,NULL,'LICENSED','DT',{str(s['is_scripps']).lower()},{str(s['is_inyo']).lower()})"
        vals.append(v)

    sql = f"""INSERT INTO fcc_stations (facility_id,callsign,channel,city,state,lat,lon,network,owner_group,dma_name,dma_rank,license_status,service_type,is_scripps,is_inyo) VALUES
{',\n'.join(vals)}
ON CONFLICT (facility_id) DO UPDATE SET
  callsign=EXCLUDED.callsign, channel=EXCLUDED.channel, city=EXCLUDED.city, state=EXCLUDED.state,
  lat=EXCLUDED.lat, lon=EXCLUDED.lon, owner_group=EXCLUDED.owner_group,
  is_scripps=EXCLUDED.is_scripps, is_inyo=EXCLUDED.is_inyo
  WHERE fcc_stations.network IS NULL;"""

    with open(fname, "w", encoding="utf-8") as f:
        f.write(sql)

print(f"\nGenerated {batch_num} SQL batch files (fcc_sql_batch_*.sql)")
print("Load them via: supabase execute_sql for each batch")

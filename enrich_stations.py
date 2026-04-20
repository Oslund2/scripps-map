"""
Enrich FCC station data with accurate owner groups, DMA info, and network affiliations.
Merges fcc_stations.txt (1,699 FCC stations) with curated marketStations.js (285 stations).
Outputs SQL batches for Supabase loading.

Usage: python enrich_stations.py
"""
import re, json, math

# ============================================================
# 1. EXPLICIT CALLSIGN → OWNER GROUP MAPPINGS (from Wikipedia)
#    These override any licensee-based matching.
# ============================================================

# Tegna — 68 stations in 54 markets (Wikipedia, April 2026)
# Note: Nexstar-Tegna merger closed Mar 2026 but integration blocked by court.
# Keeping Tegna separate for competitive analysis purposes.
TEGNA_CALLS = {
    "WZDX","KNAZ-TV","KNAZ","KPNX","KMSB","KTTU-TV","KTTU","KFSM-TV","KFSM","KTHV",
    "KXTV","KFMB-TV","KFMB","KUSA","KTVD","WTIC-TV","WTIC","WCCT-TV","WCCT",
    "WUSA","WJXX","WTLV","WTSP","WXIA-TV","WXIA","WATL","WMAZ-TV","WMAZ",
    "KTVB","KTFT-LD","KTFT","WQAD-TV","WQAD","WTHR","WALV-CD","WALV",
    "WOI-DT","WOI","KCWI-TV","KCWI","WHAS-TV","WHAS","WWL-TV","WWL","WUPL",
    "WCSH","WLBZ","WZZM","KARE","KSDK","WGRZ","WCNC-TV","WCNC",
    "WFMY-TV","WFMY","WKYC","WBNS-TV","WBNS","WTOL","WUPW","KGW",
    "WNEP-TV","WNEP","WPMT","WLTX","WBIR-TV","WBIR","WATN-TV","WATN","WLMT",
    "KXVA","KVUE","KBMT","KIII","WFAA","KFAA-TV","KFAA","KHOU","KTBU",
    "KWES-TV","KWES","KIDY","KENS","KYTX","KCEN-TV","KCEN","KAGS-LD","KAGS",
    "WVEC","KING-TV","KING","KONG","KREM","KSKN",
}

# Hearst Television — ~35 stations (Wikipedia, April 2026)
HEARST_CALLS = {
    "WVTM-TV","WVTM","KHBS","KHOG-TV","KHOG","KCRA-TV","KCRA","KQCA",
    "KSBW","WESH","WKCF","WBBH-TV","WBBH","WZVN-TV","WZVN","WMOR-TV","WMOR",
    "WPBF","WJCL","KCCI","WLKY","WDSU","WMTW","WPXT",
    "WBAL-TV","WBAL","WCVB-TV","WCVB","WAPT","KMBC-TV","KMBC","KCWE",
    "KETV","WMUR-TV","WMUR","KOAT-TV","KOAT","WXII-TV","WXII","WCWG",
    "WLWT","KOCO-TV","KOCO","WGAL","WTAE-TV","WTAE",
    "WYFF","WPTZ","WNNE","WISN-TV","WISN",
}

# Sinclair Broadcast Group — ~185 stations (Wikipedia, April 2026)
# Only listing callsigns NOT already caught by "sinclair" in licensee name
SINCLAIR_CALLS = {
    "WTTO","WABM","WDBB","WBMA-LD","WBMA","WEAR-TV","WEAR","WPMI-TV","WPMI",
    "WFGX","KATV","KBAK-TV","KBAK","KBFX-CD","KBFX","KRCR-TV","KRCR",
    "KCVU","KMPH-TV","KMPH","KMPH-CD","KFRE-TV","KFRE",
    "WJLA-TV","WJLA","WDCO-CD","WDCO","WPEC","WTVX","WGFL","WNBW-DT","WNBW",
    "WTWC-TV","WTWC","WTLF","WFXL","WGXA",
    "KGAN","KFXA","KDSM-TV","KDSM","KPTH","KMEG",
    "KBOI-TV","KBOI","KLEW-TV","KLEW","WSJV","WSBT-TV","WSBT",
    "KSAS-TV","KSAS","KAAS-TV","KAAS","KOCW","KMTW",
    "WGME-TV","WGME","WPFO","WBFF","WNUV","WUTB",
    "WEYI-TV","WEYI","WBSF","WSMH","WWMT","WPBN-TV","WPBN","WTOM-TV","WTOM",
    "WGTU","WGTQ","WUCW",
    "KBSI-TV","KBSI","WDKA","KRCG","KDNL-TV","KDNL",
    "KECI-TV","KECI","KCFW-TV","KCFW","KTVM-TV","KTVM","KDBZ-CD","KDBZ",
    "WLOS","WMYA-TV","WMYA","WYDO","WCTI-TV","WCTI","WLFL","WRDC",
    "WXLV-TV","WXLV","WMYV",
    "KFXL-TV","KFXL","KHGI-TV","KHGI","KWNB-TV","KWNB","KPTM","KXVO",
    "KENV-DT","KENV","KSNV","KVCW","KRNV-DT","KRNV","KRXI-TV","KRXI","KNSN-TV","KNSN",
    "WUTV","WNYO-TV","WNYO","WHAM-TV","WHAM","WUHF",
    "WRGB","WCWN","WSTM-TV","WSTM","WTVH",
    "WKRC-TV","WKRC","WSTR-TV","WSTR","WSYX","WTTE","WWHO","WKEF","WRGT-TV","WRGT",
    "WTOV-TV","WTOV","WNWO-TV","WNWO",
    "KOKH-TV","KOKH","KOCB","KTUL","KOKI-TV","KOKI","KMYT-TV","KMYT",
    "KVAL-TV","KVAL","KCBY-TV","KCBY","KPIC","KMTR","KMCB","KTCW","KTVL","KATU","KUNP",
    "WHP-TV","WHP","WJAC-TV","WJAC","WWCP-TV","WWCP","WATM-TV","WATM",
    "WPGH-TV","WPGH","WPNT","WOLF-TV","WOLF","WQMY","WSWB",
    "WJAR","WCIV","WTAT-TV","WTAT","WACH","WPDE-TV","WPDE","WWMB","WTGS",
    "WTVC","WFLI-TV","WFLI","WZTV","WUXP-TV","WUXP","WNAB",
    "KTXS-TV","KTXS","KVII-TV","KVII","KVIH-TV","KVIH","KEYE-TV","KEYE",
    "KBTV-TV","KBTV","KFDM","KSCC","KDBC-TV","KDBC","KFOX-TV","KFOX",
    "KMYS","WOAI-TV","WOAI","KABB",
    "KUTV","KJZZ-TV","KJZZ","KMYU",
    "WCYB-TV","WCYB","WEMT","WSET-TV","WSET","WTVZ-TV","WTVZ","WRLH-TV","WRLH",
    "KOMO-TV","KOMO","KUNS-TV","KUNS","KIMA-TV","KIMA","KEPR-TV","KEPR",
    "WCHS-TV","WCHS","WVAH-TV","WVAH","WLUK-TV","WLUK","WCWF","WMSN-TV","WMSN",
}

# Graham Media Group — 7 stations
GRAHAM_CALLS = {
    "WDIV-TV","WDIV","KPRC-TV","KPRC","WKMG-TV","WKMG","KSAT-TV","KSAT",
    "WJXT","WSLS-TV","WSLS","WPLG",
}

# Cox Media Group
COX_CALLS = {
    "WSB-TV","WSB","WHIO-TV","WHIO","WFXT","WPXI","KIRO-TV","KIRO",
    "KTVU","WSB-TV","WFTV","WRDQ",
}

# Hubbard Broadcasting
HUBBARD_CALLS = {
    "KSTP-TV","KSTP","KAAL","KOB-TV","KOB","WDIO-TV","WDIO","WHEC-TV","WHEC",
    "WNYT-TV","WNYT",
}

# Allen Media Group
ALLEN_CALLS = {
    "WJZY","WMYT-TV","WMYT","KAZD","KMPX","WPCH-TV","WPCH",
}

# Fox O&O stations (explicit overrides for Tribune-licensed Fox stations)
FOX_OO_CALLS = {
    "WTTG","WAGA-TV","WAGA","WFLD","KDFW","KRIV","KTTV","KCOP",
    "WNYW","WWOR-TV","WWOR","WTXF","KSAZ","KUTP","WJBK","KMSP-TV","KMSP",
    "KDVR","KWGN-TV","KWGN","WTVT","WOFL","WRBW","WOGX","WFXT",
}

# NBC O&O stations
NBC_OO_CALLS = {
    "WNBC","KNBC","WMAQ-TV","WMAQ","WCAU","KNTV","WTVJ","KNSD","KXAS",
    "WBTS-CD","WBTS","KSTS","WSCV","WNBTS",
}

# CBS O&O stations
CBS_OO_CALLS = {
    "WCBS-TV","WCBS","KCBS-TV","KCBS","WBBM-TV","WBBM","KYW-TV","KYW",
    "KTVT","KTXA","WJZ-TV","WJZ","WWJ-TV","WWJ","WKBD","KOVR","WFOR-TV","WFOR",
    "KCNC-TV","KCNC",
}

# ABC O&O stations (Disney/ABC)
ABC_OO_CALLS = {
    "WABC-TV","WABC","KABC-TV","KABC","WLS-TV","WLS","WPVI-TV","WPVI",
    "KTRK-TV","KTRK","KGO-TV","KGO","WTVD","KFSN-TV","KFSN",
}

# ============================================================
# 2. LICENSEE PATTERN → OWNER GROUP (fallback after callsign match)
# ============================================================
OWNER_PATTERNS = [
    (r"nexstar|tribune|mission broadcasting|white knight", "Nexstar"),
    (r"sinclair|cunningham|deerfield|howard stirk", "Sinclair"),
    (r"gray television|raycom|quincy newspaper|meredith|cordillera|schurz|evening post|hoak media", "Gray"),
    (r"tegna|multimedia holdings|multimedia ksdk|multimedia entertainment|king broadcasting|sander operating|belo tv|pacific and southern|videoindiana|combined communications of oklahoma|tegna east coast|bangor communications", "Tegna"),
    (r"hearst|ohio/oklahoma hearst", "Hearst"),
    (r"scripps broadcasting", "Scripps"),
    (r"inyo broadcast", "INYO"),
    (r"ion television license|ion media", "ION"),
    (r"fox television stations|new world communications|nw communications|wfxt \(boston\)", "Fox O&O"),
    (r"cbs broadcasting|cbs television licenses", "CBS O&O"),
    (r"nbc telemundo|nbcuniversal|nbc subsidiaries|station venture operations", "NBC O&O"),
    (r"abc holding|disney general", "ABC O&O"),
    (r"univision", "Univision"),
    (r"entravision", "Entravision"),
    (r"cox media|cox television|cmg media", "Cox"),
    (r"graham media", "Graham"),
    (r"hubbard", "Hubbard"),
    (r"allen media", "Allen Media"),
    (r"weigel", "Weigel"),
    (r"block commun", "Block"),
    (r"bahakel", "Bahakel"),
    (r"lilly broadcasting", "Lilly"),
    (r"morgan murphy", "Morgan Murphy"),
    (r"griffin licens", "Griffin"),
    (r"bonneville", "Bonneville"),
    (r"lockwood", "Lockwood"),
    (r"berkshire hathaway|post-newsweek", "Berkshire Hathaway"),
    (r"emmis", "Emmis"),
    (r"journal broadcast|journal commun", "Journal"),
    (r"forum communications", "Forum"),
    (r"sagamore ?hill|cowles montana", "SagamoreHill"),
    (r"capitol broadcasting", "Capitol"),
    (r"marquee broadcasting", "Marquee"),
    (r"bhtv license", "Bhtv"),
    (r"scripps howard|e\.w\. scripps", "Scripps"),
    (r"public broadcast|educational|university|state board|board of regents|community tv|state of|commonwealth|board of directors for ed|board of education|public media|public tele|educational tv|educational comm|board of trustees|west virginia ed", "Public/PBS"),
    (r"religious|faith|christian|daystar|trinity|tbn|cornerstone|lesea|worship|word of god|dominion broadcast|radiant life|three angels|victory television|living faith|one ministries|prime time christian|christian television|faith broadcast|tri-state christian|hope channel|sonlife|guardian commun|la promesa|global broadcast", "Religious"),
]

# Specific licensee → owner for tricky ones
LICENSEE_EXACT = {
    "KENS-TV, INC.": "Tegna",
    "KFMB-TV, LLC": "Tegna",
    "KHOU-TV, INC.": "Tegna",
    "KXTV, LLC": "Tegna",
    "KVUE TELEVISION, INC.": "Tegna",
    "KWES TELEVISION, LLC": "Tegna",
    "WBIR-TV, LLC": "Tegna",
    "WBNS-TV, INC.": "Tegna",
    "WCNC-TV, INC.": "Tegna",
    "WFAA-TV, INC.": "Tegna",
    "WFMY TELEVISION, LLC": "Tegna",
    "WKYC-TV, LLC": "Tegna",
    "WUSA-TV, INC.": "Tegna",
    "WVEC TELEVISION, LLC": "Tegna",
    "WWL-TV, INC.": "Tegna",
    "KSKN TELEVISION, INC.": "Tegna",
    "KTTU-TV, INC.": "Tegna",
    "TEGNA MEMPHIS BROADCASTING, INC.": "Tegna",
    "LSB BROADCASTING, INC.": "Tegna",
    "WTOL TELEVISION, LLC": "Tegna",
    "WUPW LICENSE SUBSIDIARY, LLC": "Tegna",
    "WTSP LICENSE SUBSIDIARY, LLC": "Tegna",
    "CEDAR-RAPIDS TV LICENSE COMPANY, LLC": "Tegna",
    # Sinclair specific licensees (all unique LLC names from Wikipedia cross-ref)
    "ACC LICENSEE, LLC": "Sinclair",
    "RINCON BROADCASTING TULSA LLC": "Sinclair",
    "CHESAPEAKE TELEVISION LICENSEE, LLC": "Sinclair",
    "PADUCAH TELEVISION LICENSE LLC": "Sinclair",
    "SECOND GENERATION OF IOWA, LTD": "Sinclair",
    "MERCURY BROADCASTING COMPANY, INC.": "Sinclair",
    "SOUTH WEST OREGON TV BROADCASTING": "Sinclair",
    "WDBB-TV, INC.": "Sinclair",
    "PALM TELEVISION, L.P.": "Sinclair",
    "NASHVILLE LICENSE HOLDINGS, L.L.C.": "Sinclair",
    "NEW YORK TELEVISION, INC.": "Sinclair",
    "WSTR ACQUISITION, LLC": "Sinclair",
    "ANDERSON (WFBC-TV) LICENSEE, INC.": "Sinclair",
    "BIRMINGHAM (WABM-TV) LICENSEE, INC.": "Sinclair",
    "BALTIMORE (WNUV-TV) LICENSEE, INC.": "Sinclair",
    "COLUMBUS (WTTE-TV) LICENSEE, INC.": "Sinclair",
    "FLINT (WBSF-TV) LICENSEE, INC.": "Sinclair",
    "RALEIGH (WRDC-TV) LICENSEE, INC.": "Sinclair",
    "JOHNSTOWN (WWCP-TV) LICENSEE, INC.": "Sinclair",
    "RENO (KENV-TV) LICENSEE, INC.": "Sinclair",
    "RENO (KRNV-TV) LICENSEE, INC.": "Sinclair",
    "HARRISBURG LICENSEE, LLC": "Sinclair",
    "KABB LICENSEE, LLC": "Sinclair",
    "KATV LICENSEE, LLC": "Sinclair",
    "KDBC LICENSEE, LLC": "Sinclair",
    "KDNL LICENSEE, LLC": "Sinclair",
    "KDSM LICENSEE, LLC": "Sinclair",
    "KEYE LICENSEE, LLC": "Sinclair",
    "KFDM LICENSEE, LLC": "Sinclair",
    "KFOX LICENSEE, LLC": "Sinclair",
    "KFRE LICENSEE, LLC": "Sinclair",
    "KGAN LICENSEE, LLC": "Sinclair",
    "KHGI LICENSEE, LLC": "Sinclair",
    "KJZZ LICENSEE, LLC": "Sinclair",
    "KLGT LICENSEE, LLC": "Sinclair",
    "KMPH LICENSEE, LLC": "Sinclair",
    "KMYT LICENSEE, LLC": "Sinclair",
    "KNSN LICENSEE, LLC": "Sinclair",
    "KOCB LICENSEE, LLC": "Sinclair",
    "KOKH LICENSEE, LLC": "Sinclair",
    "KPTH LICENSEE, LLC": "Sinclair",
    "KPTM LICENSEE, LLC": "Sinclair",
    "KRCG LICENSEE, LLC": "Sinclair",
    "KRXI LICENSEE, LLC": "Sinclair",
    "KSAS LICENSEE, LLC": "Sinclair",
    "KTUL LICENSEE, LLC": "Sinclair",
    "KTVL LICENSEE, LLC": "Sinclair",
    "KUPN LICENSEE, LLC": "Sinclair",
    "KUQI LICENSEE, LLC": "Sinclair",
    "KUTV LICENSEE, LLC": "Sinclair",
    "KVII LICENSEE, LLC": "Sinclair",
    "WACH LICENSEE, LLC": "Sinclair",
    "WCHS LICENSEE, LLC": "Sinclair",
    "WCTI LICENSEE, LLC": "Sinclair",
    "WCWB LICENSEE, LLC": "Sinclair",
    "WCWF LICENSEE, LLC": "Sinclair",
    "WCWN LICENSEE, LLC": "Sinclair",
    "WEAR LICENSEE, LLC": "Sinclair",
    "WEYI LICENSEE, LLC": "Sinclair",
    "WFGX LICENSEE, LLC": "Sinclair",
    "WFXL LICENSEE, LLC": "Sinclair",
    "WGFL LICENSEE, LLC": "Sinclair",
    "WGME LICENSEE, LLC": "Sinclair",
    "WGTU LICENSEE, LLC": "Sinclair",
    "WGXA LICENSEE, LLC": "Sinclair",
    "WHAM LICENSEE, LLC": "Sinclair",
    "WJAC LICENSEE, LLC": "Sinclair",
    "WJAR LICENSEE, LLC": "Sinclair",
    "WKEF LICENSEE L.P.": "Sinclair",
    "WKRC LICENSEE, LLC": "Sinclair",
    "WLFL LICENSEE, LLC": "Sinclair",
    "WLOS LICENSEE, LLC": "Sinclair",
    "WLUK LICENSEE, LLC": "Sinclair",
    "WMMP LICENSEE L.P.": "Sinclair",
    "WMSN LICENSEE, LLC": "Sinclair",
    "WNWO LICENSEE, LLC": "Sinclair",
    "WOAI LICENSEE, LLC": "Sinclair",
    "WOLF LICENSEE, LLC": "Sinclair",
    "WPBN LICENSEE, LLC": "Sinclair",
    "WPDE LICENSEE, LLC": "Sinclair",
    "WPEC LICENSEE, LLC": "Sinclair",
    "WPGH LICENSEE, LLC": "Sinclair",
    "WQMY LICENSEE, LLC": "Sinclair",
    "WRGB LICENSEE, LLC": "Sinclair",
    "WRLH LICENSEE, LLC": "Sinclair",
    "WSBT LICENSEE, LLC": "Sinclair",
    "WSET LICENSEE, LLC": "Sinclair",
    "WSMH LICENSEE, LLC": "Sinclair",
    "WSTQ LICENSEE, LLC": "Sinclair",
    "WSYX LICENSEE, INC.": "Sinclair",
    "WTAT LICENSEE, LLC": "Sinclair",
    "WTGS LICENSEE, LLC": "Sinclair",
    "WTOV LICENSEE, LLC": "Sinclair",
    "WTO LICENSEE, LLC": "Sinclair",
    "WTTO LICENSEE, LLC": "Sinclair",
    "WTVC LICENSEE, LLC": "Sinclair",
    "WTVX LICENSEE, LLC": "Sinclair",
    "WTVZ LICENSEE, LLC": "Sinclair",
    "WTWC LICENSEE, LLC": "Sinclair",
    "WUHF LICENSEE, LLC": "Sinclair",
    "WUTV LICENSEE, LLC": "Sinclair",
    "WUXP LICENSEE, LLC": "Sinclair",
    "WVAH LICENSEE, LLC": "Sinclair",
    "WWHO LICENSEE, LLC": "Sinclair",
    "WWMB LICENSEE, LLC": "Sinclair",
    "WWMT LICENSEE, LLC": "Sinclair",
    "WXLV LICENSEE, LLC": "Sinclair",
    "WRGT LICENSEE, LLC": "Sinclair",
    "WZTV LICENSEE, LLC": "Sinclair",
    "WUPN LICENSEE, LLC": "Sinclair",
    # Tegna additional
    "TEGNA EAST COAST BROADCASTING, LLC": "Tegna",
    "BANGOR COMMUNICATIONS, LLC": "Tegna",
    # Graham
    "POST-NEWSWEEK STATIONS, SAN ANTONIO, INC.": "Graham",
    # Cox
    "MIAMI VALLEY BROADCASTING CORPORATION": "Cox",
    "WSOC TELEVISION, LLC": "Cox",
}

# Many Sinclair stations use "[CALLSIGN] LICENSEE, LLC" pattern
# We'll handle this dynamically in the resolve function


def strip_suffix(cs):
    """Remove -TV, -DT, -CD, -LD suffixes for matching."""
    return re.sub(r'-(TV|DT|CD|LD)$', '', cs)


def resolve_owner(callsign, licensee):
    """Determine owner group from callsign + licensee."""
    cs_base = strip_suffix(callsign)

    # 1. Explicit callsign match (highest priority)
    if callsign in TEGNA_CALLS or cs_base in TEGNA_CALLS:
        return "Tegna"
    if callsign in HEARST_CALLS or cs_base in HEARST_CALLS:
        return "Hearst"
    if callsign in SINCLAIR_CALLS or cs_base in SINCLAIR_CALLS:
        return "Sinclair"
    if callsign in GRAHAM_CALLS or cs_base in GRAHAM_CALLS:
        return "Graham"
    if callsign in COX_CALLS or cs_base in COX_CALLS:
        return "Cox"
    if callsign in HUBBARD_CALLS or cs_base in HUBBARD_CALLS:
        return "Hubbard"
    if callsign in ALLEN_CALLS or cs_base in ALLEN_CALLS:
        return "Allen Media"
    if callsign in FOX_OO_CALLS or cs_base in FOX_OO_CALLS:
        return "Fox O&O"
    if callsign in NBC_OO_CALLS or cs_base in NBC_OO_CALLS:
        return "NBC O&O"
    if callsign in CBS_OO_CALLS or cs_base in CBS_OO_CALLS:
        return "CBS O&O"
    if callsign in ABC_OO_CALLS or cs_base in ABC_OO_CALLS:
        return "ABC O&O"

    # 2. Exact licensee match
    if licensee in LICENSEE_EXACT:
        return LICENSEE_EXACT[licensee]

    # 3. Licensee pattern match
    if licensee:
        for pat, group in OWNER_PATTERNS:
            if re.search(pat, licensee, re.IGNORECASE):
                return group

        # 4. Sinclair "[CALLSIGN] LICENSEE" pattern
        if re.search(r'LICENSEE', licensee, re.IGNORECASE):
            # Extract callsign from licensee name
            m = re.match(r'^([A-Z]{3,5}(?:-TV)?)\s+LICENSEE', licensee)
            if m:
                lic_call = m.group(1)
                lic_base = strip_suffix(lic_call)
                if lic_call in SINCLAIR_CALLS or lic_base in SINCLAIR_CALLS:
                    return "Sinclair"

    return "Other"


# ============================================================
# 3. DMA HUB TABLE — top 210 DMAs with hub coordinates
#    Used for nearest-neighbor geographic matching
# ============================================================
DMAS = [
    {"name":"New York","rank":1,"lat":40.71,"lon":-74.01},
    {"name":"Los Angeles","rank":2,"lat":34.05,"lon":-118.24},
    {"name":"Chicago","rank":3,"lat":41.88,"lon":-87.63},
    {"name":"Philadelphia","rank":4,"lat":39.95,"lon":-75.17},
    {"name":"Dallas-Ft. Worth","rank":5,"lat":32.78,"lon":-96.80},
    {"name":"Houston","rank":6,"lat":29.76,"lon":-95.37},
    {"name":"Washington DC","rank":7,"lat":38.91,"lon":-77.04},
    {"name":"Atlanta","rank":8,"lat":33.75,"lon":-84.39},
    {"name":"Boston","rank":9,"lat":42.36,"lon":-71.06},
    {"name":"San Francisco","rank":10,"lat":37.77,"lon":-122.42},
    {"name":"Tampa","rank":11,"lat":27.95,"lon":-82.46},
    {"name":"Phoenix","rank":12,"lat":33.45,"lon":-112.07},
    {"name":"Seattle-Tacoma","rank":13,"lat":47.61,"lon":-122.33},
    {"name":"Detroit","rank":14,"lat":42.33,"lon":-83.05},
    {"name":"Minneapolis-St. Paul","rank":15,"lat":44.98,"lon":-93.27},
    {"name":"Miami-Ft. Lauderdale","rank":16,"lat":25.76,"lon":-80.19},
    {"name":"Denver","rank":17,"lat":39.74,"lon":-104.99},
    {"name":"Orlando","rank":18,"lat":28.54,"lon":-81.38},
    {"name":"Cleveland","rank":19,"lat":41.50,"lon":-81.69},
    {"name":"Sacramento","rank":20,"lat":38.58,"lon":-121.49},
    {"name":"St. Louis","rank":21,"lat":38.63,"lon":-90.20},
    {"name":"Portland OR","rank":22,"lat":45.52,"lon":-122.68},
    {"name":"Charlotte","rank":23,"lat":35.23,"lon":-80.84},
    {"name":"Pittsburgh","rank":24,"lat":40.44,"lon":-80.00},
    {"name":"Indianapolis","rank":25,"lat":39.77,"lon":-86.16},
    {"name":"Baltimore","rank":26,"lat":39.29,"lon":-76.61},
    {"name":"San Diego","rank":27,"lat":32.72,"lon":-117.16},
    {"name":"Nashville","rank":29,"lat":36.16,"lon":-86.78},
    {"name":"Hartford-New Haven","rank":30,"lat":41.76,"lon":-72.68},
    {"name":"Columbus OH","rank":31,"lat":39.96,"lon":-82.99},
    {"name":"Kansas City","rank":32,"lat":39.10,"lon":-94.58},
    {"name":"Salt Lake City","rank":33,"lat":40.76,"lon":-111.89},
    {"name":"Milwaukee","rank":34,"lat":43.04,"lon":-87.91},
    {"name":"San Antonio","rank":35,"lat":29.42,"lon":-98.49},
    {"name":"Cincinnati","rank":36,"lat":39.10,"lon":-84.51},
    {"name":"Austin","rank":37,"lat":30.27,"lon":-97.74},
    {"name":"Grand Rapids","rank":38,"lat":42.96,"lon":-85.67},
    {"name":"Las Vegas","rank":39,"lat":36.17,"lon":-115.14},
    {"name":"West Palm Beach","rank":40,"lat":26.72,"lon":-80.05},
    {"name":"Oklahoma City","rank":41,"lat":35.47,"lon":-97.52},
    {"name":"Raleigh-Durham","rank":42,"lat":35.78,"lon":-78.64},
    {"name":"Greenville-Spartanburg","rank":43,"lat":34.85,"lon":-82.39},
    {"name":"Norfolk-Virginia Beach","rank":44,"lat":36.85,"lon":-76.29},
    {"name":"Birmingham","rank":45,"lat":33.52,"lon":-86.80},
    {"name":"Albuquerque","rank":46,"lat":35.08,"lon":-106.65},
    {"name":"Greensboro-Winston Salem","rank":47,"lat":36.07,"lon":-79.79},
    {"name":"Jacksonville","rank":48,"lat":30.33,"lon":-81.66},
    {"name":"Louisville","rank":49,"lat":38.25,"lon":-85.76},
    {"name":"Memphis","rank":50,"lat":35.15,"lon":-90.05},
    {"name":"Buffalo","rank":51,"lat":42.89,"lon":-78.88},
    {"name":"Providence","rank":52,"lat":41.82,"lon":-71.41},
    {"name":"Richmond","rank":53,"lat":37.54,"lon":-77.44},
    {"name":"Fresno","rank":54,"lat":36.75,"lon":-119.77},
    {"name":"Little Rock","rank":55,"lat":34.75,"lon":-92.29},
    {"name":"Wilkes Barre-Scranton","rank":56,"lat":41.25,"lon":-75.88},
    {"name":"Albany NY","rank":57,"lat":42.65,"lon":-73.76},
    {"name":"Fort Myers-Naples","rank":58,"lat":26.64,"lon":-81.87},
    {"name":"New Orleans","rank":59,"lat":29.95,"lon":-90.07},
    {"name":"Knoxville","rank":60,"lat":35.96,"lon":-83.92},
    {"name":"Tulsa","rank":61,"lat":36.15,"lon":-95.99},
    {"name":"Dayton","rank":62,"lat":39.76,"lon":-84.19},
    {"name":"Lexington","rank":63,"lat":38.04,"lon":-84.50},
    {"name":"Honolulu","rank":64,"lat":21.31,"lon":-157.86},
    {"name":"Des Moines","rank":65,"lat":41.59,"lon":-93.62},
    {"name":"Wichita","rank":66,"lat":37.69,"lon":-97.34},
    {"name":"Green Bay","rank":67,"lat":44.51,"lon":-88.01},
    {"name":"Tucson","rank":68,"lat":32.22,"lon":-110.97},
    {"name":"Omaha","rank":69,"lat":41.26,"lon":-95.93},
    {"name":"Spokane","rank":70,"lat":47.66,"lon":-117.43},
    {"name":"Springfield MO","rank":71,"lat":37.22,"lon":-93.29},
    {"name":"Flint-Saginaw","rank":72,"lat":43.01,"lon":-83.69},
    {"name":"Huntsville-Decatur","rank":73,"lat":34.73,"lon":-86.59},
    {"name":"Columbia SC","rank":74,"lat":34.00,"lon":-81.03},
    {"name":"Rochester NY","rank":75,"lat":43.16,"lon":-77.61},
    {"name":"Toledo","rank":76,"lat":41.65,"lon":-83.54},
    {"name":"Shreveport","rank":77,"lat":32.53,"lon":-93.75},
    {"name":"Champaign-Springfield IL","rank":78,"lat":40.12,"lon":-88.24},
    {"name":"Madison WI","rank":79,"lat":43.07,"lon":-89.40},
    {"name":"Chattanooga","rank":80,"lat":35.05,"lon":-85.31},
    {"name":"Harlingen-McAllen","rank":81,"lat":26.19,"lon":-97.70},
    {"name":"Cedar Rapids","rank":82,"lat":42.01,"lon":-91.64},
    {"name":"Waco-Temple","rank":83,"lat":31.55,"lon":-97.15},
    {"name":"Colorado Springs-Pueblo","rank":84,"lat":38.83,"lon":-104.82},
    {"name":"Paducah-Cape Girardeau","rank":85,"lat":37.08,"lon":-89.51},
    {"name":"Savannah","rank":86,"lat":32.08,"lon":-81.10},
    {"name":"Baton Rouge","rank":87,"lat":30.45,"lon":-91.19},
    {"name":"El Paso","rank":88,"lat":31.76,"lon":-106.44},
    {"name":"Charleston-Huntington","rank":89,"lat":38.35,"lon":-81.63},
    {"name":"Davenport-Rock Island","rank":90,"lat":41.52,"lon":-90.58},
    {"name":"Ft. Smith-Fayetteville","rank":91,"lat":35.39,"lon":-94.40},
    {"name":"Greenville NC","rank":92,"lat":35.61,"lon":-77.37},
    {"name":"Evansville","rank":93,"lat":37.97,"lon":-87.56},
    {"name":"Boise","rank":94,"lat":43.62,"lon":-116.20},
    {"name":"Tyler-Longview","rank":95,"lat":32.35,"lon":-95.30},
    {"name":"Myrtle Beach-Florence","rank":96,"lat":34.20,"lon":-79.76},
    {"name":"Sioux Falls","rank":97,"lat":43.55,"lon":-96.73},
    {"name":"Lansing","rank":98,"lat":42.73,"lon":-84.56},
    {"name":"Traverse City","rank":99,"lat":44.76,"lon":-85.62},
    {"name":"Burlington VT","rank":100,"lat":44.48,"lon":-73.21},
    {"name":"Springfield MA","rank":101,"lat":42.10,"lon":-72.59},
    {"name":"South Bend","rank":102,"lat":41.68,"lon":-86.25},
    {"name":"Macon","rank":103,"lat":32.84,"lon":-83.63},
    {"name":"Roanoke-Lynchburg","rank":104,"lat":37.27,"lon":-79.94},
    {"name":"Augusta GA","rank":105,"lat":33.47,"lon":-81.97},
    {"name":"Corpus Christi","rank":106,"lat":27.80,"lon":-97.40},
    {"name":"Tallahassee-Thomasville","rank":107,"lat":30.44,"lon":-84.28},
    {"name":"Terre Haute","rank":108,"lat":39.47,"lon":-87.41},
    {"name":"Columbus GA","rank":109,"lat":32.46,"lon":-84.99},
    {"name":"Amarillo","rank":110,"lat":35.22,"lon":-101.83},
    {"name":"Boise","rank":111,"lat":43.62,"lon":-116.20},
    {"name":"Chico-Redding","rank":112,"lat":40.59,"lon":-122.39},
    {"name":"Wichita Falls-Lawton","rank":113,"lat":34.13,"lon":-98.39},
    {"name":"La Crosse-Eau Claire","rank":114,"lat":43.81,"lon":-91.25},
    {"name":"Monterey-Salinas","rank":115,"lat":36.60,"lon":-121.89},
    {"name":"Bakersfield","rank":116,"lat":35.37,"lon":-119.02},
    {"name":"Lafayette LA","rank":117,"lat":30.22,"lon":-92.02},
    {"name":"Columbus-Tupelo","rank":118,"lat":33.50,"lon":-88.43},
    {"name":"San Luis Obispo","rank":119,"lat":35.28,"lon":-120.66},
    {"name":"Santa Barbara","rank":120,"lat":34.42,"lon":-119.70},
    {"name":"Duluth-Superior","rank":121,"lat":46.79,"lon":-92.10},
    {"name":"Beaumont-Port Arthur","rank":122,"lat":30.08,"lon":-94.10},
    {"name":"Palm Springs","rank":123,"lat":33.83,"lon":-116.55},
    {"name":"Monroe-El Dorado","rank":124,"lat":32.51,"lon":-92.12},
    {"name":"Tri-Cities TN-VA","rank":125,"lat":36.55,"lon":-82.56},
    {"name":"Peoria-Bloomington","rank":126,"lat":40.69,"lon":-89.59},
    {"name":"Harrisburg-Lancaster PA","rank":127,"lat":40.27,"lon":-76.88},
    {"name":"Anchorage","rank":128,"lat":61.22,"lon":-149.90},
    {"name":"Wausau-Rhinelander","rank":129,"lat":44.96,"lon":-89.63},
    {"name":"Topeka","rank":130,"lat":39.05,"lon":-95.68},
    {"name":"Eugene","rank":131,"lat":44.05,"lon":-123.09},
    {"name":"Ft. Wayne","rank":132,"lat":41.08,"lon":-85.14},
    {"name":"Youngstown","rank":133,"lat":41.10,"lon":-80.65},
    {"name":"Minot-Bismarck","rank":134,"lat":48.23,"lon":-101.30},
    {"name":"Odessa-Midland","rank":135,"lat":31.95,"lon":-102.10},
    {"name":"Lubbock","rank":136,"lat":33.58,"lon":-101.85},
    {"name":"Medford-Klamath Falls","rank":137,"lat":42.33,"lon":-122.87},
    {"name":"Bangor","rank":138,"lat":44.80,"lon":-68.77},
    {"name":"Syracuse","rank":139,"lat":43.05,"lon":-76.15},
    {"name":"Mobile-Pensacola","rank":140,"lat":30.69,"lon":-88.04},
    {"name":"Portland-Auburn ME","rank":141,"lat":43.66,"lon":-70.26},
    {"name":"Jackson MS","rank":142,"lat":32.30,"lon":-90.18},
    {"name":"Idaho Falls-Pocatello","rank":143,"lat":43.49,"lon":-112.04},
    {"name":"Abilene-Sweetwater","rank":144,"lat":32.45,"lon":-99.73},
    {"name":"Missoula","rank":145,"lat":46.87,"lon":-113.99},
    {"name":"Rapid City","rank":146,"lat":44.08,"lon":-103.23},
    {"name":"Joplin-Pittsburg","rank":147,"lat":37.08,"lon":-94.51},
    {"name":"Billings","rank":148,"lat":45.78,"lon":-108.50},
    {"name":"Utica","rank":149,"lat":43.10,"lon":-75.23},
    {"name":"Hattiesburg-Laurel","rank":150,"lat":31.33,"lon":-89.29},
    {"name":"Sioux City","rank":151,"lat":42.50,"lon":-96.40},
    {"name":"Yakima-Pasco","rank":152,"lat":46.60,"lon":-120.51},
    {"name":"Erie","rank":153,"lat":42.13,"lon":-80.09},
    {"name":"Clarksburg-Weston","rank":154,"lat":39.28,"lon":-80.34},
    {"name":"Rochester MN-Mason City","rank":155,"lat":44.02,"lon":-92.47},
    {"name":"Salisbury","rank":156,"lat":38.37,"lon":-75.60},
    {"name":"Columbia-Jefferson City","rank":157,"lat":38.95,"lon":-92.33},
    {"name":"Watertown","rank":158,"lat":43.97,"lon":-75.91},
    {"name":"Elmira-Corning","rank":159,"lat":42.09,"lon":-76.81},
    {"name":"Rockford","rank":160,"lat":42.27,"lon":-89.09},
    {"name":"Quincy-Hannibal","rank":161,"lat":39.94,"lon":-91.41},
    {"name":"Bowling Green","rank":162,"lat":36.99,"lon":-86.44},
    {"name":"Alexandria LA","rank":163,"lat":31.31,"lon":-92.45},
    {"name":"San Angelo","rank":164,"lat":31.46,"lon":-100.44},
    {"name":"Great Falls","rank":165,"lat":47.51,"lon":-111.30},
    {"name":"Panama City","rank":166,"lat":30.16,"lon":-85.66},
    {"name":"Johnstown-Altoona","rank":167,"lat":40.33,"lon":-78.92},
    {"name":"Wheeling-Steubenville","rank":168,"lat":40.06,"lon":-80.72},
    {"name":"Twin Falls","rank":169,"lat":42.56,"lon":-114.46},
    {"name":"Butte-Bozeman","rank":170,"lat":45.78,"lon":-111.53},
    {"name":"Bend OR","rank":171,"lat":44.06,"lon":-121.31},
    {"name":"Lake Charles","rank":172,"lat":30.23,"lon":-93.22},
    {"name":"Gainesville","rank":173,"lat":29.65,"lon":-82.32},
    {"name":"Meridian","rank":174,"lat":32.35,"lon":-88.70},
    {"name":"Bluefield-Beckley","rank":175,"lat":37.27,"lon":-81.22},
    {"name":"Dothan","rank":176,"lat":31.22,"lon":-85.39},
    {"name":"Marquette","rank":177,"lat":46.54,"lon":-87.40},
    {"name":"Jonesboro","rank":178,"lat":35.84,"lon":-90.70},
    {"name":"Parkersburg","rank":179,"lat":39.27,"lon":-81.56},
    {"name":"Charlottesville","rank":180,"lat":38.03,"lon":-78.48},
    {"name":"Zanesville","rank":181,"lat":39.94,"lon":-82.01},
    {"name":"Harrisonburg","rank":182,"lat":38.45,"lon":-78.87},
    {"name":"Presque Isle","rank":183,"lat":46.68,"lon":-68.02},
    {"name":"Helena","rank":184,"lat":46.59,"lon":-112.04},
    {"name":"Juneau","rank":185,"lat":58.30,"lon":-134.42},
    {"name":"Eureka","rank":186,"lat":40.80,"lon":-124.16},
    {"name":"Casper-Riverton","rank":187,"lat":42.87,"lon":-106.31},
    {"name":"Mankato","rank":188,"lat":44.16,"lon":-93.99},
    {"name":"Laredo","rank":189,"lat":27.51,"lon":-99.51},
    {"name":"Ottumwa-Kirksville","rank":190,"lat":41.02,"lon":-92.41},
    {"name":"Lima","rank":191,"lat":40.74,"lon":-84.11},
    {"name":"Fairbanks","rank":192,"lat":64.84,"lon":-147.72},
    {"name":"Grand Junction","rank":193,"lat":39.06,"lon":-108.55},
    {"name":"Victoria","rank":194,"lat":28.81,"lon":-97.00},
    {"name":"Fargo-Valley City","rank":195,"lat":46.88,"lon":-96.79},
    {"name":"Cheyenne-Scottsbluff","rank":196,"lat":41.14,"lon":-104.82},
    {"name":"Biloxi-Gulfport","rank":197,"lat":30.40,"lon":-88.88},
    {"name":"Waterloo-Cedar Falls","rank":198,"lat":42.49,"lon":-92.34},
    {"name":"Yuma-El Centro","rank":199,"lat":32.69,"lon":-114.62},
    {"name":"Alpena","rank":200,"lat":45.06,"lon":-83.43},
    {"name":"North Platte","rank":201,"lat":41.12,"lon":-100.77},
    {"name":"Glendive","rank":202,"lat":47.11,"lon":-104.71},
]

def haversine_miles(lat1, lon1, lat2, lon2):
    """Great-circle distance in miles."""
    R = 3959  # Earth radius in miles
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def find_nearest_dma(lat, lon):
    """Find nearest DMA hub by geographic distance."""
    best = None
    best_dist = float('inf')
    for d in DMAS:
        dist = haversine_miles(lat, lon, d["lat"], d["lon"])
        if dist < best_dist:
            best_dist = dist
            best = d
    return best["name"], best["rank"]


# ============================================================
# 4. NETWORK AFFILIATION INFERENCE
# ============================================================
# For O&O groups, network is deterministic
OWNER_NETWORK = {
    "Fox O&O": "Fox",
    "CBS O&O": "CBS",
    "NBC O&O": "NBC",
    "ABC O&O": "ABC",
    "ION": "ION",
    "INYO": "ION",
    "Public/PBS": "PBS",
    "Religious": "Religious",
    "Univision": "Univision",
    "Entravision": "Univision",
}


# ============================================================
# 5. LOAD AND MERGE DATA
# ============================================================

def load_fcc_data(path="fcc_stations.txt"):
    """Load pipe-delimited FCC station data."""
    stations = {}
    with open(path, "r", encoding="utf-8") as f:
        f.readline()  # skip header
        for line in f:
            parts = line.strip().split("|")
            if len(parts) < 7:
                continue
            cs, ch, city, state, licensee, lat, lon = parts[:7]
            if not cs or cs == "-" or not lat or not lon:
                continue
            try:
                lat_f = float(lat)
                lon_f = float(lon)
            except ValueError:
                continue

            cs_clean = cs.strip()
            owner = resolve_owner(cs_clean, licensee.strip())

            stations[cs_clean] = {
                "callsign": cs_clean,
                "channel": int(ch) if ch.strip().isdigit() else None,
                "city": city.strip().title(),
                "state": state.strip(),
                "lat": round(lat_f, 6),
                "lon": round(lon_f, 6),
                "licensee": licensee.strip(),
                "owner_group": owner,
                "network": OWNER_NETWORK.get(owner),
                "dma_name": None,
                "dma_rank": None,
                "is_scripps": owner == "Scripps",
                "is_inyo": owner == "INYO",
            }
    return stations


def load_curated_data(path="src/data/marketStations.js"):
    """Parse the curated JS file to extract station records."""
    stations = {}
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Match each station object in the JS array
    pattern = re.compile(
        r'\{callsign:"([^"]+)".*?channel:(\d+).*?city:"([^"]+)".*?state:"([^"]+)"'
        r'.*?lat:([\d.-]+).*?lon:([\d.-]+).*?network:"([^"]+)".*?owner_group:"([^"]+)"'
        r'.*?dma_name:"([^"]+)".*?dma_rank:(\d+)',
        re.DOTALL
    )

    for m in pattern.finditer(content):
        cs = m.group(1)
        stations[cs] = {
            "callsign": cs,
            "channel": int(m.group(2)),
            "city": m.group(3),
            "state": m.group(4),
            "lat": float(m.group(5)),
            "lon": float(m.group(6)),
            "network": m.group(7),
            "owner_group": m.group(8),
            "dma_name": m.group(9),
            "dma_rank": int(m.group(10)),
            "is_scripps": m.group(8) in ("Scripps", "ION"),
            "is_inyo": m.group(8) == "INYO",
        }
    return stations


def facility_hash(callsign):
    """Deterministic hash from callsign (base form)."""
    cs = strip_suffix(callsign)
    h = 0
    for c in cs:
        h = ((h << 5) - h + ord(c)) & 0xFFFFFFFF
    return (h % 900000) + 100000


def esc(v):
    if v is None:
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"


def main():
    print("=== FCC Station Enrichment Pipeline ===\n")

    # Load sources
    fcc = load_fcc_data()
    print(f"Loaded {len(fcc)} FCC stations")

    curated = load_curated_data()
    print(f"Loaded {len(curated)} curated stations")

    # Merge: curated data overrides FCC data
    merged = {}

    # Start with FCC stations
    for cs, s in fcc.items():
        cs_base = strip_suffix(cs)
        merged[cs_base] = s.copy()
        merged[cs_base]["callsign"] = cs_base  # normalize to base form

    # Override with curated data (curated always has base callsign form)
    curated_matched = 0
    curated_added = 0
    for cs, s in curated.items():
        if cs in merged:
            # Override network, DMA, owner from curated (keep FCC lat/lon if more precise)
            merged[cs]["network"] = s["network"]
            merged[cs]["dma_name"] = s["dma_name"]
            merged[cs]["dma_rank"] = s["dma_rank"]
            merged[cs]["owner_group"] = s["owner_group"]
            merged[cs]["is_scripps"] = s["is_scripps"]
            merged[cs]["is_inyo"] = s["is_inyo"]
            curated_matched += 1
        else:
            # Add curated station not in FCC data (e.g., Mexican border stations)
            merged[cs] = s.copy()
            curated_added += 1

    print(f"Curated matched: {curated_matched}, added: {curated_added}")
    print(f"Total merged: {len(merged)}")

    # Assign DMAs via nearest-hub for stations without DMA
    dma_assigned = 0
    for cs, s in merged.items():
        if not s.get("dma_name") and s.get("lat") and s.get("lon"):
            dma_name, dma_rank = find_nearest_dma(s["lat"], s["lon"])
            s["dma_name"] = dma_name
            s["dma_rank"] = dma_rank
            dma_assigned += 1
    print(f"DMAs assigned via nearest-hub: {dma_assigned}")

    # Owner group stats
    owners = {}
    for s in merged.values():
        g = s["owner_group"]
        owners[g] = owners.get(g, 0) + 1
    print("\nOwner group counts:")
    for g, c in sorted(owners.items(), key=lambda x: -x[1]):
        print(f"  {g}: {c}")

    # Network stats
    net_count = sum(1 for s in merged.values() if s.get("network"))
    print(f"\nStations with network affiliation: {net_count}/{len(merged)}")

    # Generate SQL batches
    stations_list = sorted(merged.values(), key=lambda s: (s.get("dma_rank") or 999, s["callsign"]))

    BATCH = 100
    batch_num = 0
    total_rows = 0

    for i in range(0, len(stations_list), BATCH):
        batch = stations_list[i:i+BATCH]
        batch_num += 1
        fname = f"fcc_enriched_batch_{batch_num}.sql"

        vals = []
        for s in batch:
            fid = facility_hash(s["callsign"])
            v = (f"({fid},{esc(s['callsign'])},"
                 f"{s['channel'] if s.get('channel') else 'NULL'},"
                 f"{esc(s['city'])},{esc(s['state'])},"
                 f"{s['lat']:.6f},{s['lon']:.6f},"
                 f"{esc(s.get('network'))},"
                 f"{esc(s['owner_group'])},"
                 f"{esc(s.get('dma_name'))},"
                 f"{s.get('dma_rank') or 'NULL'},"
                 f"'LICENSED','DT',"
                 f"{str(s.get('is_scripps', False)).lower()},"
                 f"{str(s.get('is_inyo', False)).lower()})")
            vals.append(v)

        # First batch truncates the table
        prefix = ""
        if batch_num == 1:
            prefix = "DELETE FROM fcc_stations;\n\n"

        sql = f"""{prefix}INSERT INTO fcc_stations (facility_id,callsign,channel,city,state,lat,lon,network,owner_group,dma_name,dma_rank,license_status,service_type,is_scripps,is_inyo) VALUES
{',\n'.join(vals)}
ON CONFLICT (facility_id) DO UPDATE SET
  callsign=EXCLUDED.callsign, channel=EXCLUDED.channel, city=EXCLUDED.city, state=EXCLUDED.state,
  lat=EXCLUDED.lat, lon=EXCLUDED.lon, network=EXCLUDED.network, owner_group=EXCLUDED.owner_group,
  dma_name=EXCLUDED.dma_name, dma_rank=EXCLUDED.dma_rank,
  is_scripps=EXCLUDED.is_scripps, is_inyo=EXCLUDED.is_inyo;"""

        with open(fname, "w", encoding="utf-8") as f:
            f.write(sql)
        total_rows += len(batch)

    print(f"\nGenerated {batch_num} SQL batch files (fcc_enriched_batch_*.sql)")
    print(f"Total rows: {total_rows}")
    print("\nLoad into Supabase: run each batch via SQL Editor or execute_sql")


if __name__ == "__main__":
    main()

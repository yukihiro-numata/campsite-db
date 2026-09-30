"""東京駅からキャンプ場の座標までの所要時間(分)を計算する。

OSRM の公開サーバー(router.project-osrm.org)の車の経路で、渋滞なしの値。
duration(秒)を分に直して四捨五入する。

使い方: python3 travel.py 36.105016 139.114251
"""

import json
import sys
import urllib.request

ORIGIN = (35.6812, 139.7671)  # 東京駅
URL = "https://router.project-osrm.org/route/v1/driving/{}?overview=false"


def travel_minutes(lat, lng):
    coords = f"{ORIGIN[1]},{ORIGIN[0]};{lng},{lat}"
    with urllib.request.urlopen(URL.format(coords)) as res:
        route = json.load(res)["routes"][0]
    return round(route["duration"] / 60)


if __name__ == "__main__":
    print(travel_minutes(float(sys.argv[1]), float(sys.argv[2])))

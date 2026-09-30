"""座標から高速道路・国道・鉄道までの直線距離(m)を計算する。

国土地理院ベクトルタイル(experimental_bvmap、ズーム 16)の
road レイヤー(rdCtg 0=国道、3=高速)と railway レイヤー(ftCode 8201)を使う。
半径 1,500m 以内にないものは null。

使い方: python3 distance.py 36.105016 139.114251
"""

import json
import math
import os
import subprocess
import sys
import tempfile

import mapbox_vector_tile

Z = 16
RADIUS = 1500
TILE_URL = "https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf"
CACHE = os.path.join(tempfile.gettempdir(), "campsite-db-bvmap")


def to_tile(lat, lng):
    n = 2**Z
    x = (lng + 180) / 360 * n
    r = math.radians(lat)
    y = (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * n
    return x, y


def to_latlng(tx, ty, px, py, extent):
    n = 2**Z
    x = tx + px / extent
    y = ty + py / extent
    lng = x / n * 360 - 180
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))
    return lat, lng


def fetch(tx, ty):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, f"{Z}_{tx}_{ty}.pbf")
    if not os.path.exists(path):
        url = TILE_URL.format(z=Z, x=tx, y=ty)
        subprocess.run(["curl", "-sS", "-f", "-o", path, url])
    if not os.path.exists(path):
        return {}  # タイルがない(海など)
    with open(path, "rb") as f:
        return mapbox_vector_tile.decode(
            f.read(), default_options={"y_coord_down": True}
        )


def lines(geom):
    t, c = geom["type"], geom["coordinates"]
    if t == "LineString":
        yield c
    elif t == "MultiLineString":
        yield from c


def category(layer, props):
    if layer == "road":
        return {0: "nationalRoad", 3: "expressway"}.get(props.get("rdCtg"))
    if layer == "railway" and props.get("ftCode") == 8201:
        return "railway"
    return None


def distances(lat, lng):
    x, y = to_tile(lat, lng)
    # 座標のまわりを平面(m)に近似する
    kx = 111320 * math.cos(math.radians(lat))
    ky = 110540
    tile_m = 40075016.686 * math.cos(math.radians(lat)) / 2**Z
    r = math.ceil(RADIUS / tile_m) + 1

    best = {"expressway": None, "nationalRoad": None, "railway": None}
    for tx in range(int(x) - r, int(x) + r + 1):
        for ty in range(int(y) - r, int(y) + r + 1):
            tile = fetch(tx, ty)
            for layer in ("road", "railway"):
                if layer not in tile:
                    continue
                extent = tile[layer].get("extent", 4096)
                for ft in tile[layer]["features"]:
                    key = category(layer, ft["properties"])
                    if not key:
                        continue
                    for line in lines(ft["geometry"]):
                        pts = [to_latlng(tx, ty, px, py, extent) for px, py in line]
                        pts = [((b - lng) * kx, (a - lat) * ky) for a, b in pts]
                        for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
                            dx, dy = x2 - x1, y2 - y1
                            l2 = dx * dx + dy * dy
                            t = 0 if l2 == 0 else max(0, min(1, -(x1 * dx + y1 * dy) / l2))
                            d = math.hypot(x1 + t * dx, y1 + t * dy)
                            if best[key] is None or d < best[key]:
                                best[key] = d
    return {
        k: (round(v) if v is not None and v <= RADIUS else None)
        for k, v in best.items()
    }


if __name__ == "__main__":
    print(json.dumps(distances(float(sys.argv[1]), float(sys.argv[2]))))

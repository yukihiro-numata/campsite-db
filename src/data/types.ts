/** 値をどこで確かめたか。 */
export type Source = {
  /** 公式サイト / 予約サイト / こちらで計算 */
  kind: "official" | "booking" | "calculated";
  /** 確かめたページ。計算した値は使ったデータやツールのページ */
  url: string;
  /** 計算した値の手順など */
  note?: string;
  /** 調べた日(YYYY-MM-DD) */
  checkedOn: string;
};

/**
 * 出典付きの値。
 * known: 値が分かっている
 * notStated: 不明。調べたが、出典に書かれていなかった。source は調べたページ
 * unchecked: 未調査。まだ調べていない
 */
export type Fact<T> =
  | { status: "known"; value: T; source: Source }
  | { status: "notStated"; source: Source }
  | { status: "unchecked" };

/** 区画の広さ(㎡)。公式の「約」の値をそのまま持つ */
export type Area = { min: number; max: number; note?: string };

export type CarAccess = "inside" | "front" | "none";

/** 区画サイト / フリーサイト */
export type Layout = "plot" | "free";

/** 場内にある入浴設備のうち一番上のもの。風呂 / シャワーだけ / どちらもない */
export type Bathing = "bath" | "shower" | "none";

export type GroupPolicy = {
  /**
   * no: 友人同士の複数家族などのグループを断っている
   * conditional: 受け入れるが、人数の上限や事前の相談などの制限が書かれている
   * yes: 制限が書かれていない、またはグループ向けとして案内している
   */
  allowed: "yes" | "conditional" | "no";
  note?: string;
};

export type SiteType = {
  name: string;
  area: Fact<Area>;
  carAccess: Fact<CarAccess>;
  layout: Fact<Layout>;
  /** AC 電源を使えるか */
  power: Fact<boolean>;
  /** ペットを連れて泊まれるか */
  pets: Fact<boolean>;
};

/** 緯度・経度 */
export type LatLng = { lat: number; lng: number };

export type Campsite = {
  id: number;
  name: string;
  location: Fact<LatLng>;
  /** 都道府県(公式の住所から) */
  prefecture: Fact<string>;
  /** 都心からの所要時間(分) */
  travelMinutes: Fact<number>;
  /** 代表地点の標高(m) */
  elevation: Fact<number>;
  /** 静粛時間(HH:MM)。終わりの時刻が書かれていなければ end はない */
  quietHours: Fact<{ start: string; end?: string }>;
  groupPolicy: Fact<GroupPolicy>;
  /** 代表地点からの直線距離(m)。null は半径 1,500m 以内にない */
  distanceTo: {
    expressway: Fact<number | null>;
    nationalRoad: Fact<number | null>;
    railway: Fact<number | null>;
    /** 海岸線 */
    sea: Fact<number | null>;
    /** 湖・池の岸 */
    lake: Fact<number | null>;
    /** 幅のある川の岸(細い川・用水路は含まない) */
    river: Fact<number | null>;
  };
  groundTypes: Fact<string[]>;
  toiletFeatures: Fact<string[]>;
  totalSites: Fact<number>;
  bathing: Fact<Bathing>;
  /** 道具を借りられるか */
  rental: Fact<boolean>;
  /** デイキャンプができるか */
  dayCamp: Fact<boolean>;
  siteTypes: SiteType[];
};

/** 計算スクリプトで出す値。キャンプ場ごとに src/data/calculated.ts に書き出す */
export type CalculatedValues = {
  travelMinutes: number;
  /** null は標高データがない座標 */
  elevation: number | null;
  distanceTo: {
    expressway: number | null;
    nationalRoad: number | null;
    railway: number | null;
    sea: number | null;
    lake: number | null;
    river: number | null;
  };
};

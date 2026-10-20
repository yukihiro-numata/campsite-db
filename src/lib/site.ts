// サイト全体の名前と説明。ページのタイトル・説明、共有したときの表示に使う

export const siteName = "campsite-db";

/** 名前だけでは何のサイトか伝わらないので、タイトルに添える説明 */
export const tagline = "区画の広さ・静かさで探す関東近郊のキャンプ場";

export const siteDescription =
  "関東近郊のキャンプ場を、区画の広さ・静粛時間・道路や鉄道からの距離など、行く前に分かりにくいスペックで絞り込んで比べられます。";

/** 本番の URL。共有したときの画像などを絶対 URL にするのに使う */
export const siteUrl = new URL("https://campsite-db.vercel.app");

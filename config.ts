import { Config } from "./src/config";

type HotelInfo = {
  id: number;
  url: string;
  name: string | null;
  address: string | null;
  phone: string | null;
}

export const defaultConfig: Config = {
  // クロールを開始するURL: string
  url: "https://happyhotel.jp/search/kodawari/list?page=1",

  // このパターンに一致するリンクのみをクロール対象とする: string | string[]
  match: [
    "https://happyhotel.jp/hotels/*"
  ],

  // このセレクタで指定された要素からインナーテキストを取得する: string
  selector: ".inbox",

  // 最大でこの数のページをクロールする: number
  maxPagesToCrawl: 20,

  // クロール結果を保存するファイル名: string
  outputFileName: "output.json",

  // 各ページの読み込み間の待ち時間: number
  waitTime: 1000,

  // 各ページ訪問時に実行される関数
  onVisitPage: async ({ page, pushData, visitPageWaitTime }) => {
    // 現在のページのURLを取得
    const url = new URL(page.url());
    console.log("url: " + url.href);

    // 詳細ページ
    let m: RegExpMatchArray | null;
    if ((m = url.href.match(/^https:\/\/happyhotel\.jp\/hotels\/(\d+)/)) && m?.length >= 2) {

      const hotelId = parseInt(m[1]) || 0;
      const urlHref = url.href;

      const info = await page.evaluate(({hotelId, urlHref}) => {
        const $ = (selector: string) => document.querySelector(selector);
        const $$ = (selector: string) => document.querySelectorAll(selector);

        const itemListElements = Array.from(document.querySelectorAll('li[itemprop="itemListElement"]'));
        const maxPosition = Math.max(...itemListElements.map(li =>
            parseInt(li.querySelector('[itemprop="position"]')?.getAttribute('content') ?? "")));
        const targetElement = itemListElements.find(li =>
            parseInt(li.querySelector('[itemprop="position"]')?.getAttribute('content') ?? "") === maxPosition - 1);

        // /search/address/pref/13/cities/13106
        const areaPath = targetElement ? targetElement.querySelector('[itemprop="item"]')?.getAttribute("href") : null;
        const ma = areaPath?.match(/^\/search\/address\/pref\/(\d+)\/cities\/(\d+)/)
        console.log(areaPath, ma);

        const info = {
          id: hotelId,
          url: urlHref,
          name: $(".tit")!.textContent ?? null,
          address: $(".common-hotelList_address .txt")?.textContent ?? null,
          phone: $(".common-hotelList_tel .txt")?.textContent ?? null,

          // 都道府県id: number, 市区町村id: number
          pref_id: parseInt(ma?.[1] || "") || 0,
          city_id: parseInt(ma?.[2] || "") || 0,

          // 空室確認可否: bool、画像有無: bool, 予約可否: bool, クーポン有無: bool, 公式サイト有無: bool
          has_status: !!$(".hoteldetail_basiclist_third"),
          has_image: !!$(".hoteldetail_img img[src]"),
          can_reserve: !!$(".hoteldetail_optionlist .reserved"),
          has_coupon: !!$(".hoteldetail_optionlist .coupon"),
          has_official: !!$(".hoteldetail_optionlist .link_o"),

          // 部屋数: int | null、評価数: int | null、評価スコア: float | null
          room_count: parseInt($(".hoteldetailList_section .first")?.nextElementSibling?.textContent?.replace(/[^\d]+$/, "") || "") ?? null,
          rate_count: parseInt($(".common-hotelList_rating .num")?.textContent || "") ?? null,
          rate_score: parseFloat($(".common-hotelList_rating .score")?.textContent || "") ?? null,

          // 徒歩経路: string | null、車経路: string | null、ホテルPR: string | null
          access_walk: $(".common-hotelList_walk .txt")?.textContent ?? null,
          access_car: $(".common-hotelList_car .txt")?.textContent ?? null,
          hotel_pr: $(".hoteldetail_basiclist_sixth p")?.textContent ?? null,

          // ホテル情報、料金、設備、サービス・その他情報
          basic_info: {},
          price_info: {},
          equipment_info: {},
          other_info: {},
        };

        $$(".hoteldetailList_section > section").forEach(section => {
          const additionalInfo = Object.fromEntries(
            Array.from(section?.querySelectorAll("dl > dt:not(dl > dd dl > dt)"))
              .filter(dt => !!dt?.textContent?.trim())
              .map(dt => [dt?.textContent, dt?.nextElementSibling?.innerHTML ?? ""]));

          switch (section.querySelector(".hoteldetail_sstit")?.textContent) {
            case "ホテル情報": info.basic_info = additionalInfo; break;

            case "料金":
              info.price_info = additionalInfo;
              break;

            case "設備": info.equipment_info = additionalInfo; break;
            case "サービス・その他情報": info.other_info = additionalInfo; break;
          }
        })

        return info;
      }, {hotelId, urlHref});

      await pushData(info);
    }

    // 次のページへの遷移前に待機
    await new Promise(resolve => setTimeout(resolve, visitPageWaitTime ?? 1000));
  }
  // ユーザーエージェント: string
  //userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  // クッキー: { name: string; value: string }
  // cookie: {},
};

import { Config } from "./src/config";

export const defaultConfig: Config = {
  // クロールを開始するURL: string
  url: "https://happyhotel.jp/search/kodawari/list?page=1",
  // このパターンに一致するリンクのみをクロール対象とする: string | string[]
  match: [
    "https://happyhotel.jp/hotels/*"
  ],
  // このセレクタで指定された要素からインナーテキストを取得する: string
  selector: ".hoteldetail, .searchResultWrap .inbox",
  // 最大でこの数のページをクロールする: number
  maxPagesToCrawl: 100,
  // クロール結果を保存するファイル名: string
  outputFileName: "output.json",
  // 各ページの読み込み間の待ち時間: number
  waitTime: 1000,
  // 各ページ訪問時に実行される関数
  onVisitPage: async ({ page, pushData, visitPageWaitTime }) => {
    // 現在のページのURLを取得
    const url = new URL(page.url());
    console.log("url: " + url.href);

    // ページネーションURL
    if (url.href.startsWith("https://happyhotel.jp/search/kodawari/list?page=")) {
      // 次のページネーションリンクを探す
      // .common-pager .next: 次のページネーション, .common-hotelList_name__text: 詳細ページ
      const m = url.href.match(/^https:\/\/happyhotel\.jp\/search\/kodawari\/list\?page=(\d+)/);
      const params = url.searchParams;
      const nextPageNum = params.has("page") ? parseInt(params.get("page") ?? "0") + 1 : 0;
      const nextPageLink = "https://happyhotel.jp/search/kodawari/list?page=" + nextPageNum;
      // const nextPageLink = await page.$eval('.common-pager .next', el => el.getAttribute("href"));

      // 次のページのリンクが見つかれば、データに追加
      if (nextPageLink) {
        await pushData({ link: nextPageLink });
        console.log(`pushData: ${nextPageLink}`)
        /*
        page.goto(nextPageLink, {
          timeout: 8000,
          waitUntil: "domcontentloaded",
        });
        return;
        */
      }

    // ホテル詳細ページのURL：コンテンツ取得
    /*} else if (url.startsWith("https://happyhotel.jp/hotels/")) {
      const pageType = "detail";
      const html = await page.$eval('.hoteldetail', el => el.innerHTML);
      await pushData({ pageType, url, html });

    // それ以外の場合：HTMLを取得
    } else {
      const pageType = "other";
      const html = await page.content;
      await pushData({ pageType, url, html });*/
    }

    // 次のページへの遷移前に待機
    await new Promise(resolve => setTimeout(resolve, visitPageWaitTime ?? 1000));
  }
  // ユーザーエージェント: string
  //userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  // クッキー: { name: string; value: string }
  // cookie: {},
};

import { defaultConfig } from "../config.js";
import { crawl, write } from "./core.js";
import { URL } from 'url';

async function main() {
    const url = new URL(defaultConfig.url);
    const startPage = 1; // 開始ページ
    const endPage = 3; // 終了ページ（必要に応じて変更）

    for (let page = startPage; page <= endPage; page++) {
        url.searchParams.set('page', page.toString());
        defaultConfig.url = url.toString();

        console.log(`page: ${page} / ${endPage}, url: ${url}`);
        await crawl(defaultConfig);
        await write(defaultConfig);
    }
}

main();

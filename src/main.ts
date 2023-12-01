import { defaultConfig } from "../config.js";
import { crawl, write } from "./core.js";
import { URL } from 'url';
import { promises as fs } from 'fs';

//const fs = require('fs').promises;

async function main() {
    const startPage = 1; // 開始ページ
    const endPage = 275; // 終了ページ（必要に応じて変更） 275

    const errorLogFile = 'output_errors.json'; // エラーログファイル名
    let errors = [];

    const url = new URL(defaultConfig.url);
    const startTime = performance.now();

    for (let page = startPage; page <= endPage; page++) {
        url.searchParams.set('page', page.toString());
        defaultConfig.url = url.toString();

        try {
            await crawl(defaultConfig);
            await write(defaultConfig);

        } catch(e) {
            if (e instanceof Error) {
                const time = performance.now() - startTime;
                const timeStr = formatElapsedTime(time);
                // '{"t":"00:02:23", "page":3, "url":"https://localhost", "message": "---"}'
                const errorInfo = {t: timeStr, page, url: url.toString(), message: e.message};
                console.warn(errorInfo)
                errors.push(errorInfo);

                // エラー情報をファイルに書き込む
                await fs.writeFile(errorLogFile, JSON.stringify(errors, null, 2));
            }
        }

        const time = performance.now() - startTime;
        const timeStr = formatElapsedTime(time);
        console.log(`* ${timeStr} | page: ${page} / ${endPage}, error: ${errors.length}, ${url}`);
    }
}

function formatElapsedTime(milliseconds: number) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    // 2桁表示にする
    const hoursStr = hours.toString();
    const minutesStr = (minutes % 60).toString().padStart(2, '0');
    const secondsStr = (seconds % 60).toString().padStart(2, '0');

    return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

main();

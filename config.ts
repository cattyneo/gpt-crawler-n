import { Config } from "./src/config";

export const defaultConfig: Config = {
  url: "https://www.builder.io/c/docs/developers",
  match: "https://www.builder.io/c/docs/**",
  maxPagesToCrawl: 50,
  outputFileName: "output.json",
  waitTime: 1000,
  onVisitPage: async ({ visitPageWaitTime }) => {
    await new Promise(resolve => setTimeout(resolve, visitPageWaitTime ?? 1000));
  },
  userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
};

# GPT Crawler

※これは以下のリポジトリをフォークしたものです。READMEに関しては、フォーク元のものを日本語訳しております。

https://github.com/builderio/gpt-crawler

GPTクローラーは、あるURLまたは複数のURLからデータを収集し、カスタムGPT（OpenAIの自然言語処理モデル）を作成するための知識ファイルを生成するためのツールです。

![クロール実行を示すGIF](https://github.com/BuilderIO/gpt-crawler/assets/844291/feb8763a-152b-4708-9c92-013b5c70d2f2)

- [GPT Crawler](#gpt-crawler)
  - [例](#例)
  - [始め方](#始め方)
    - [ローカルでの実行](#ローカルでの実行)
      - [リポジトリをクローンする](#リポジトリをクローンする)
      - [依存関係をインストール](#依存関係をインストール)
      - [クローラーを設定する](#クローラーを設定する)
      - [クローラーを実行する](#クローラーを実行する)
    - [別の方法](#別の方法)
      - [Dockerを使ってコンテナで実行する](#dockerを使ってコンテナで実行する)
    - [OpenAIにデータをアップロードする](#openaiにデータをアップロードする)
      - [カスタムGPTを作成する](#カスタムgptを作成する)
      - [カスタムアシスタントを作成する](#カスタムアシスタントを作成する)
  - [Contributing](#contributing)

## 例

[こちらはカスタムGPT](https://chat.openai.com/g/g-kywiqipmR-builder-io-assistant)です。Builder.ioのドキュメントにあるURLを提供するだけで、[Builder.io](https://www.builder.io)の使い方や統合方法についての質問に答えるのを速やかに手伝ってくれます。

このプロジェクトはドキュメントをクロールし、カスタムGPTに入力可能なファイルを出力します。

[自分でも試してみましょう](https://chat.openai.com/g/g-kywiqipmR-builder-io-assistant)。サイトにBuilder.ioを統合する方法について質問してください。

> この機能にアクセスするには有料のChatGPTプランが必要な場合があります。

## 始め方

### ローカルでの実行

#### リポジトリをクローンする

Node.js >= 16がインストールされていることを確認してください。

```sh
git clone https://github.com/builderio/gpt-crawler
```

#### 依存関係をインストール

```sh
npm i
```
もしくは
```sh
npm install
```

#### クローラーを設定する

[config.ts](config.ts) を開いて、プロパティを変更してください。

例えば、カスタムGPTを作成するためにBuilder.ioのドキュメントをクロールするには、次のように設定を書きます。

```ts
export const defaultConfig: Config = {
  url: "https://www.builder.io/c/docs/developers",
  match: "https://www.builder.io/c/docs/**",
  selector: `.docs-builder-container`,
  maxPagesToCrawl: 50,
  outputFileName: "output.json",
};
```

```ts
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
```

利用可能なすべてのオプションについて説明します。

```ts
type Config = {
  // クロールを開始するURL
  url: string;
  // このパターンに一致するリンクのみをクロール対象とする
  match: string | string[];
  // このセレクタで指定された要素からインナーテキストを取得する
  selector: string;
  // 最大でこの数のページをクロールする
  maxPagesToCrawl: number;
  // クロール結果を保存するファイル名
  outputFileName: string;
  // 必要に応じて設定されるクッキー
  cookie?: { name: string; value: string };
  // 各ページ訪問時に実行されるオプショナルな関数
  onVisitPage?: (options: {
    page: Page;
    pushData: (data: any) => Promise<void>;
    visitPageWaitTime?: number;
  }) => Promise<void>;
  // セレクタが表示されるまで待機するオプショナルなタイムアウト
  waitForSelectorTimeout?: number;
    // 使用するオプショナルなユーザーエージェント
  userAgent?: string;
  // 各ページの読み込み間のオプショナルな待ち時間
  waitTime?: number;
};
```

#### クローラーを実行する

```sh
npm start
```
もしくは
```sh
npm run start:cross-env
```

### 別の方法

#### [Dockerを使ってコンテナで実行する](./containerapp/README.md)

`output.json` をコンテナ化された実行で得るには、`containerapp` ディレクトリに移動します。上記と同じように `config.ts` を修正し、`data` フォルダに `output.json` ファイルが生成されるはずです。注：`containerapp` フォルダ内の `config.ts` ファイルにある `outputFileName` プロパティは、コンテナで動作するように設定されています。

### OpenAIにデータをアップロードする

クロールはこのプロジェクトのルートに `output.json` というファイルを生成します。それを[OpenAIにアップロード](https://platform.openai.com/docs/assistants/overview)して、カスタムアシスタントやカスタムGPTを作成します。

#### カスタムGPTを作成する

生成された知識にUIでアクセスし、他の人と簡単に共有できるオプションを使用します

> 注：現在カスタムGPTを作成して使用するには、有料のChatGPTプランが必要な場合があります。

1. [https://chat.openai.com/](https://chat.openai.com/) にアクセスします。
2. 左下隅にあるあなたの名前をクリックします。
3. メニューから「My GPTs」を選択します。
4. 「Create a GPT」を選択します。
5. 「Configure」を選択します。
6. 「Knowledge」の下で「Upload a file」を選択し、生成したファイルをアップロードします。

![カスタムGPTをアップロードする方法のGIF](https://github.com/BuilderIO/gpt-crawler/assets/844291/22f27fb5-6ca5-4748-9edd-6bcf00b408cf)

#### カスタムアシスタントを作成する

生成した知識にAPIアクセスし、製品に統合できるこのオプションを使用します。

1. [https://platform.openai.com/assistants](https://platform.openai.com/assistants) にアクセスします。
2. "+ Create" をクリックします。
3. "upload" を選択して、生成したファイルをアップロードします。

![アシスタントへのアップロード方法のGIF](https://github.com/BuilderIO/gpt-crawler/assets/844291/06e6ad36-e2ba-4c6e-8d5a-bf329140de49)

## Contributing

Know how to make this project better? Send a PR!

<br>
<br>

<p align="center">
   <a href="https://www.builder.io/m/developers">
      <picture>
         <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/844291/230786554-eb225eeb-2f6b-4286-b8c2-535b1131744a.png">
         <img width="250" alt="Made with love by Builder.io" src="https://user-images.githubusercontent.com/844291/230786555-a58479e4-75f3-4222-a6eb-74c5af953eac.png">
       </picture>
   </a>
</p>

また、このリポジトリのフォーク元である、Builder.ioの開発者の方々に感謝します。
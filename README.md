# Vulneratter
## 概要
セキュアコーディングを学ぶための脆弱なアプリケーション

!!後日詳細なドキュメントを追加予定!!

## 注意
**本アプリケーションは学習を目的としたものであり、決して悪意ある攻撃の実行を示唆するものではありません。本アプリケーションによって起こった損害について、製作者は一切の責任を持ちません。**

## 初回手順
1. 依存関係をインストール

    ```
    npm install
    ```

2. 証明書を生成

    ```
    npm run create-cert
    ```

3. ルート証明書をインストール
    
    `ssl/rootCA.pem`をローカル環境に「信頼されたルート証明機関」としてインストール（Windowsの場合は拡張子を`crt`に変更）

4. `config`のシンボリックリンクを作成

    ```
    npm run create-config-symlink
    ```

5. データベースのマイグレーション

    ```
    npm run migrate
    ```

6. DBの初期データを生成

    ```
    npm run -w backend seed
    ```

## 起動
```
npm run -w backend start
npm run -w frontend start
```

## ディレクトリ構成
基本的に確認する必要のあるディレクトリは以下です
```
backend             // バックエンド関連のディレクトリ
└ src
  └ controllers     // バックエンドの各APIのロジック本体
frontend            // フロントエンド関連のディレクトリ
└ src
 └ app
   ├ guards         // 各ページへのアクセス制御を行うロジック
   ├ pages          // 各ページのコンポーネント
   └ services       // APIアクセス等のサービス
```

## 脆弱性の設定
設定ファイル`config/config.ts`にて、脆弱性の有効・無効を設定できます。
```
export const config = {
	vulnerabilities: {
		rawPassword: true, // パスワードの非ハッシュ化
		xss: true, // XSS
		improperAuth: true, // 認証・認可不備
	},
};
```
* `vulnerabilities.rawPassword`を`true`にすると、データベースにパスワードを生の状態（非ハッシュ化）で保存します。
* `vulnerabilities.xss`を`true`にすると、XSSが有効になります。
* `vulnerabilities.improperAuth`を`true`にすると、認証・認可の不備が発生します。

## 今後実装予定の脆弱性
* SQLi
* セッション管理の不備
* SSRF
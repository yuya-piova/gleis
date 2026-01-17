import { Client, isNotionClientError } from '@notionhq/client';
import {
  PageObjectResponse,
  QueryDatabaseParameters,
} from '@notionhq/client/build/src/api-endpoints';
import { NextResponse } from 'next/server';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// --- 1. 型定義 ---

// フロントエンドに返すデータの型
export type Task = {
  id: string;
  name: string; // UIに合わせて title -> name に変更
  date: string | null;
  state: string;
  cat: string;
  subCats: string[];
  theme: string;
  summary: string;
  url: string;
};

// --- 2. ヘルパー関数（Notionの複雑な型から安全に値を抜く） ---

// 部分的なページデータを除外する型ガード
function isFullPage(response: unknown): response is PageObjectResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'properties' in response &&
    'object' in response &&
    (response as any).object === 'page'
  );
}

// プロパティ取得用ユーティリティ
const getProp = {
  // タイトル取得 (title)
  title: (page: PageObjectResponse, propName: string): string => {
    const prop = page.properties[propName];
    if (prop?.type === 'title' && prop.title.length > 0) {
      return prop.title[0].plain_text;
    }
    return 'No Title';
  },

  // テキスト取得 (rich_text)
  text: (page: PageObjectResponse, propName: string): string => {
    const prop = page.properties[propName];
    if (prop?.type === 'rich_text' && prop.rich_text.length > 0) {
      return prop.rich_text[0].plain_text;
    }
    return '';
  },

  // 日付取得 (date)
  date: (page: PageObjectResponse, propName: string): string | null => {
    const prop = page.properties[propName];
    if (prop?.type === 'date') {
      return prop.date?.start ?? null;
    }
    return null;
  },

  // ステータス取得 (status | select)
  status: (page: PageObjectResponse, propName: string): string => {
    const prop = page.properties[propName];
    if (prop?.type === 'status') return prop.status?.name ?? 'Unknown';
    if (prop?.type === 'select') return prop.select?.name ?? 'Unknown';
    return 'Unknown';
  },

  // 単一セレクト取得 (select)
  select: (page: PageObjectResponse, propName: string): string => {
    const prop = page.properties[propName];
    if (prop?.type === 'select') {
      return prop.select?.name ?? '';
    }
    return '';
  },

  // 複数セレクト取得 (multi_select) - 配列で返す
  multiSelect: (page: PageObjectResponse, propName: string): string[] => {
    const prop = page.properties[propName];
    if (prop?.type === 'multi_select') {
      return prop.multi_select.map((item) => item.name);
    }
    return [];
  },
};

// --- 3. メイン処理 ---

export async function GET(req: Request) {
  if (!DATABASE_ID) {
    return NextResponse.json({ error: 'Database ID missing' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const targetDate = searchParams.get('date');

  // フィルタ条件の作成
  const filters: any[] = [
    { property: 'State', status: { does_not_equal: 'Canceled' } },
    { property: 'State', status: { does_not_equal: 'Done' } },
  ];

  if (targetDate) {
    filters.push({ property: 'Date', date: { equals: targetDate } });
  }

  const queryParams: QueryDatabaseParameters = {
    database_id: DATABASE_ID,
    filter: { and: filters } as any, // Notionフィルタの型定義は複雑すぎるため、ここだけはany許容が現実的
    sorts: [{ property: 'Date', direction: 'ascending' }],
  };

  try {
    const response = await notion.databases.query(queryParams);

    // データの変換（マッピング）
    const tasks: Task[] = response.results
      .filter(isFullPage) // 型ガードで PageObjectResponse に絞り込み
      .map((page) => {
        // ヘルパー関数を使って安全に値を取得
        const cats = getProp.multiSelect(page, 'Cat');
        // CatがSelect型の場合のフォールバック（以前のコードにあったロジックを考慮）
        if (cats.length === 0) {
          const singleCat = getProp.select(page, 'Cat');
          if (singleCat) cats.push(singleCat);
        }

        const isWork = cats.includes('Work');
        const isLife = cats.includes('Life');
        const themeColor = isWork ? 'blue' : isLife ? 'green' : 'gray';

        return {
          id: page.id,
          name: getProp.title(page, 'Name'), // 以前は title でしたが UIに合わせて name に
          date: getProp.date(page, 'Date'),
          state: getProp.status(page, 'State'),
          cat: cats[0] || '',
          subCats: getProp.multiSelect(page, 'SubCat'),
          theme: themeColor,
          summary: getProp.text(page, '要約'),
          url: page.url,
        };
      });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Notion API Error:', error);
    if (isNotionClientError(error)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

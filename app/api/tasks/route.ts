import { Client, isNotionClientError } from '@notionhq/client';
import {
  GetPageResponse, // ここを戻しました
  QueryDatabaseParameters,
} from '@notionhq/client/build/src/api-endpoints';
import { NextResponse } from 'next/server';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// --- 1. 型定義 ---

// バージョン差異を吸収するための型定義
// GetPageResponseの中から、完全なページ情報（propertiesを持っているもの）を抽出
type PageObjectResponse = Extract<GetPageResponse, { properties: any }>;

export type Task = {
  id: string;
  name: string;
  date: string | null;
  state: string;
  cat: string;
  subCats: string[];
  theme: string;
  summary: string;
  url: string;
};

// --- 2. ヘルパー関数 ---

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
  title: (page: PageObjectResponse, propName: string): string => {
    const prop = (page.properties as any)[propName]; // 型定義が緩い場合に備え as any で安全にアクセス
    if (prop?.type === 'title' && prop.title.length > 0) {
      return prop.title[0].plain_text;
    }
    return 'No Title';
  },

  text: (page: PageObjectResponse, propName: string): string => {
    const prop = (page.properties as any)[propName];
    if (prop?.type === 'rich_text' && prop.rich_text.length > 0) {
      return prop.rich_text[0].plain_text;
    }
    return '';
  },

  date: (page: PageObjectResponse, propName: string): string | null => {
    const prop = (page.properties as any)[propName];
    if (prop?.type === 'date') {
      return prop.date?.start ?? null;
    }
    return null;
  },

  status: (page: PageObjectResponse, propName: string): string => {
    const prop = (page.properties as any)[propName];
    if (prop?.type === 'status') return prop.status?.name ?? 'Unknown';
    if (prop?.type === 'select') return prop.select?.name ?? 'Unknown';
    return 'Unknown';
  },

  select: (page: PageObjectResponse, propName: string): string => {
    const prop = (page.properties as any)[propName];
    if (prop?.type === 'select') {
      return prop.select?.name ?? '';
    }
    return '';
  },

  multiSelect: (page: PageObjectResponse, propName: string): string[] => {
    const prop = (page.properties as any)[propName];
    if (prop?.type === 'multi_select') {
      return prop.multi_select.map((item: any) => item.name);
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

  const filters: any[] = [
    { property: 'State', status: { does_not_equal: 'Canceled' } },
    { property: 'State', status: { does_not_equal: 'Done' } },
  ];

  if (targetDate) {
    filters.push({ property: 'Date', date: { equals: targetDate } });
  }

  const queryParams: QueryDatabaseParameters = {
    database_id: DATABASE_ID,
    filter: { and: filters } as any,
    sorts: [{ property: 'Date', direction: 'ascending' }],
  };

  try {
    const response = await notion.databases.query(queryParams);

    const tasks: Task[] = response.results.filter(isFullPage).map((page) => {
      const cats = getProp.multiSelect(page, 'Cat');
      if (cats.length === 0) {
        const singleCat = getProp.select(page, 'Cat');
        if (singleCat) cats.push(singleCat);
      }

      const isWork = cats.includes('Work');
      const isLife = cats.includes('Life');
      const themeColor = isWork ? 'blue' : isLife ? 'green' : 'gray';

      return {
        id: page.id,
        name: getProp.title(page, 'Name'),
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

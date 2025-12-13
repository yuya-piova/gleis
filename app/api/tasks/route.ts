import {
  Client,
  isFullPage,
  isFullDatabase,
  isFullBlock,
  isFullPageOrDatabase,
  isNotionClientError,
} from '@notionhq/client';
import {
  GetPageResponse,
  QueryDatabaseParameters,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { NextResponse } from 'next/server';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// フロントエンドで扱いやすいタスクの型
type CleanTask = {
  id: string;
  title: string;
  date: string | null;
  state: string;
  cat: string;
  subCats: string[];
  theme: string;
  url: string;
};

// Next.jsのAPI Routeハンドラー
export async function GET() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    // 成功した場合でも、環境変数がない場合はエラーを返す
    return NextResponse.json(
      { error: 'NOTION_DATABASE_ID is missing in environment variables.' },
      { status: 500 }
    );
  }

  // データベースクエリのパラメーター
  const queryParams: QueryDatabaseParameters = {
    database_id: databaseId,
    filter: {
      property: 'State',
      // ★ 修正ポイント: あなたのNotionの「State」プロパティが
      //    「Select」タイプであれば 'select' を使います。
      //    「Status」タイプであれば 'status' に書き換えてください。
      select: {
        does_not_equal: 'Done', // 'Done' 以外を取得
      },
    },
    sorts: [
      {
        property: 'Date',
        direction: 'ascending',
      },
    ],
  };

  try {
    // ★ エラー箇所: notion.databases.query を実行
    const response = await notion.databases.query(queryParams);

    // データの整形処理
    const tasks: CleanTask[] = response.results
      .filter((page): page is GetPageResponse => isFullPage(page)) // 完全なページオブジェクトのみをフィルタ
      .map((page: GetPageResponse) => {
        const props = page.properties as any; // プロパティは dynamic なため any を使用

        const cats = props.Cat?.multi_select?.map((c: any) => c.name) || [];
        const isWork = cats.includes('Work');
        const isLife = cats.includes('Life');

        let themeColor = 'gray';
        if (isWork) themeColor = 'blue';
        if (isLife) themeColor = 'green';

        return {
          id: page.id,
          title: props.Name?.title[0]?.plain_text || 'No Title',
          date: props.Date?.date?.start || null,
          state:
            props.State?.select?.name || props.State?.status?.name || 'Unknown',
          cat: cats[0] || '',
          subCats: props.SubCat?.multi_select?.map((c: any) => c.name) || [],
          theme: themeColor,
          url: page.url,
        };
      });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Notion API Error:', error);

    // Notionクライアントのエラーの場合
    if (isNotionClientError(error)) {
      return NextResponse.json(
        { error: `Notion Error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unknown error occurred while fetching tasks.' },
      { status: 500 }
    );
  }
}

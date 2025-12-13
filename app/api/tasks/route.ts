import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Notionの型定義（簡易版）
type NotionPage = {
  id: string;
  properties: {
    Name: { title: { plain_text: string }[] };
    Date: { date: { start: string } | null };
    State: { select: { name: string } | null }; // selectかstatusか確認。今回はselectと仮定
    Cat: { multi_select: { name: string }[] };
    SubCat: { multi_select: { name: string }[] };
  };
  url: string;
};

export async function GET() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    return NextResponse.json(
      { error: 'Database ID is missing' },
      { status: 500 }
    );
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'State',
        // select ではなく status プロパティの場合は 'status' に書き換えてください
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
    });

    // フロントエンドで使いやすい形にデータを整形（マッピング）
    const tasks = response.results.map((page: any) => {
      const props = page.properties;

      // Cat(Work/Life)の判定
      const cats = props.Cat?.multi_select?.map((c: any) => c.name) || [];
      const isWork = cats.includes('Work');
      const isLife = cats.includes('Life');

      // 色の決定
      let themeColor = 'gray'; // デフォルト
      if (isWork) themeColor = 'blue';
      if (isLife) themeColor = 'green';

      return {
        id: page.id,
        title: props.Name?.title[0]?.plain_text || 'No Title',
        date: props.Date?.date?.start || null, // YYYY-MM-DD
        state:
          props.State?.select?.name || props.State?.status?.name || 'Unknown',
        cat: cats[0] || '', // 表示用に最初の1つだけ取る
        subCats: props.SubCat?.multi_select?.map((c: any) => c.name) || [],
        theme: themeColor,
        url: page.url, // Notionを開くURL
      };
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

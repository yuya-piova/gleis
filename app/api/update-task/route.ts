import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// POSTリクエストハンドラー
export async function POST(request: Request) {
  try {
    const { id, status, date } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const properties: any = {};

    // ステータス変更の処理
    if (status) {
      properties['State'] = {
        status: {
          name: status,
        },
      };
    }

    // 日付変更の処理
    if (date) {
      if (date === 'null') {
        // 日付をクリアする場合
        properties['Date'] = { date: null };
      } else {
        properties['Date'] = {
          date: {
            start: date, // 期待される形式: YYYY-MM-DD
          },
        };
      }
    }

    // ページを更新する
    if (Object.keys(properties).length > 0) {
      await notion.pages.update({
        page_id: id,
        properties: properties,
      });
    }

    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task on Notion' },
      { status: 500 }
    );
  }
}

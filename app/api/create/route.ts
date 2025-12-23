// app/api/tasks/create/route.ts
import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID!;

export async function POST(req: Request) {
  const { title, date } = await req.json();
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Title: { title: [{ text: { content: title || '新規タスク' } }] },
        Date: { date: date ? { start: date } : null },
        State: { select: { name: 'INBOX' } }, // 初期ステータス
      },
    });
    return NextResponse.json({ id: response.id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

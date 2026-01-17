import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID!;

export async function GET() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          { property: 'Cat', multi_select: { contains: 'Work' } },
          { property: 'SubCat', multi_select: { contains: 'Meeting' } },
        ],
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 100,
    });

    const meetings = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.Name?.title[0]?.plain_text || '無題',
      date: page.properties.Date?.date?.start || '',
      state: page.properties.State?.status?.name || '',
      summary: page.properties['要約']?.rich_text[0]?.plain_text || '',
      keywords:
        page.properties.FreeKeyWord?.multi_select.map((s: any) => s.name) || [],
      url: page.url,
    }));

    return NextResponse.json(meetings);
  } catch (error: any) {
    console.error('Meeting fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

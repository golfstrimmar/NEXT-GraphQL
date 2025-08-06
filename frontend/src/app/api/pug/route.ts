import { NextResponse } from "next/server";
import * as pug from "pug";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const html = pug.render(code);
    return NextResponse.json({ html });
  } catch (e) {
    return NextResponse.json(
      { error: `Pug Error: ${e.message}` },
      { status: 500 }
    );
  }
}

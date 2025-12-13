import { NextRequest, NextResponse } from 'next/server';

export const config = {
  // 認証を適用するパスを定義（すべてに適用）
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)'],
};

export function middleware(req: NextRequest) {
  // 環境変数から認証情報を取得
  const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER;
  const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

  // 認証情報が設定されていない場合は認証をスキップ（開発環境用）
  if (!BASIC_AUTH_USER || !BASIC_AUTH_PASSWORD) {
    console.warn('Basic Auth is not configured. Access is unrestricted.');
    return NextResponse.next();
  }

  // 1. Authorizationヘッダーをチェック
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return respondUnauthorized();
  }

  // 2. ヘッダーからBase64エンコードされた認証情報を抽出
  const [scheme, encoded] = authHeader.split(' ');
  if (scheme !== 'Basic' || !encoded) {
    return respondUnauthorized();
  }

  // 3. デコードしてIDとパスワードを比較
  const decoded = Buffer.from(encoded, 'base64').toString();
  const [user, password] = decoded.split(':');

  if (user === BASIC_AUTH_USER && password === BASIC_AUTH_PASSWORD) {
    // 認証成功
    return NextResponse.next();
  } else {
    // 認証失敗
    return respondUnauthorized();
  }
}

// 認証失敗時のレスポンス（ブラウザに認証ダイアログを表示させる）
function respondUnauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

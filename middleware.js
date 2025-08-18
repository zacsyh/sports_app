import { NextResponse } from 'next/server';

export function middleware(request) {
  // 设定的正确密码
  const correctPassword = 'Syh08240319';
  
  // 从请求中获取密码（通过查询参数）
  const password = request.nextUrl.searchParams.get('password');
  
  // 如果密码正确，允许访问
  if (password === correctPassword) {
    return NextResponse.next();
  }
  
  // 密码错误或未提供，返回 401 未授权
  return new NextResponse('Unauthorized: Please provide correct password in URL as ?password=yourSecretPassword', { 
    status: 401
  });
}

// 配置该 middleware 匹配的路径
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
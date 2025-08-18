export default function middleware(request) {
  // 设定的正确密码
  const correctPassword = 'Syh08240319';
  
  // 从请求中获取密码（通过查询参数）
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');
  
  // 如果密码正确，允许访问
  if (password === correctPassword) {
    return new Response(null, { status: 200 });
  }
  
  // 密码错误或未提供，返回 401 未授权
  return new Response('Unauthorized: Please provide correct password in URL as ?password=Syh08240319', { 
    status: 401,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}

// 配置该 middleware 匹配的路径
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
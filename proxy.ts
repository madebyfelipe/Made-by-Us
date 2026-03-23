import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = await getToken({ req: request })

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token.isActive === false) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'User is inactive' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')
  const isOwner = token.role === 'OWNER'

  if (isAdminPage && !isOwner) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isAdminApi && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon\\.ico).*)'],
}

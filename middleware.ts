import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest, res: NextResponse) {
    const client = createMiddlewareClient({ req, res })

    const { data: { session } } = await client.auth.getSession()
    const user = session?.user;

    if (user) {
        return new NextResponse()
    } else {
        return NextResponse.redirect('/login')
    }
}
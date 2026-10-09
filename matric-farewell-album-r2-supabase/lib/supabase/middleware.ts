import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

type CookieToSet = { name: string; value: string; options?: any }

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  let refreshedCookies: CookieToSet[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          refreshedCookies = cookiesToSet
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data } = await supabase.auth.getClaims()
  const signedIn = Boolean(data?.claims?.sub)
  const pathname = request.nextUrl.pathname
  const isLogin = pathname.startsWith("/login")

  if (!signedIn && !isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    const redirectResponse = NextResponse.redirect(url)
    refreshedCookies.forEach(({ name, value, options }) =>
      redirectResponse.cookies.set(name, value, options),
    )
    return redirectResponse
  }

  if (signedIn && isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    url.search = ""
    const redirectResponse = NextResponse.redirect(url)
    refreshedCookies.forEach(({ name, value, options }) =>
      redirectResponse.cookies.set(name, value, options),
    )
    return redirectResponse
  }

  return response
}

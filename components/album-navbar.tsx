import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { isAlbumAdmin } from "@/lib/admin"
import LogoutButton from "@/components/logout-button"

export default async function AlbumNavbar() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  return (
    <header className="sticky top-0 z-50 border-b border-[#C7A27D]/20 bg-[#0E1A24]/90 text-[#F8F3ED] backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-serif text-xl tracking-wide">
          Matric Farewell
        </Link>
        <div className="flex items-center gap-2">
          {isAlbumAdmin(user?.email) && (
            <Link
              href="/upload"
              className="rounded-full border border-[#0BE0E6]/60 px-4 py-2 text-sm text-[#0BE0E6] transition hover:bg-[#0BE0E6] hover:text-[#0E1A24]"
            >
              Upload photos
            </Link>
          )}
          {user && <LogoutButton />}
        </div>
      </div>
    </header>
  )
}

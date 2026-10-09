import { redirect } from "next/navigation"
import AlbumNavbar from "@/components/album-navbar"
import UploadForm from "@/components/upload-form"
import { createClient } from "@/lib/supabase/server"
import { isAlbumAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export default async function UploadPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect("/login")
  if (!isAlbumAdmin(data.user.email)) redirect("/")

  return (
    <div className="min-h-screen bg-black text-white">
      <AlbumNavbar />
      <main className="container mx-auto max-w-3xl px-4 py-12 md:py-20">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/40">Album administration</p>
        <h1 className="font-serif text-4xl md:text-6xl">Upload photos</h1>
        <p className="mb-10 mt-4 max-w-2xl leading-7 text-white/50">
          Choose one of the five sections and upload one or more photographs. The browser sends the files directly to Cloudflare R2.
        </p>
        <UploadForm />
      </main>
    </div>
  )
}

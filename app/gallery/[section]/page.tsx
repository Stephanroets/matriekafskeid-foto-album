import Link from "next/link"
import { notFound } from "next/navigation"
import AlbumNavbar from "@/components/album-navbar"
import PhotoGrid from "@/components/photo-grid"
import { getAlbumSection } from "@/lib/album-sections"
import { listSectionPhotos } from "@/lib/r2"

export const dynamic = "force-dynamic"

export default async function GalleryPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: slug } = await params
  const section = getAlbumSection(slug)
  if (!section) notFound()
  const validSection = section!

  const photos = await listSectionPhotos(validSection.slug, validSection.r2Prefix)

  return (
    <div className="min-h-screen bg-black text-white">
      <AlbumNavbar />
      <main className="container mx-auto px-4 py-10 md:py-16">
        <Link href="/" className="text-sm text-white/45 transition hover:text-white">← All sections</Link>
        <div className="mb-10 mt-7 flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/40">Matric Farewell</p>
            <h1 className="font-serif text-4xl md:text-6xl">{validSection.name}</h1>
            <p className="mt-3 max-w-2xl text-white/50">{validSection.description}</p>
          </div>
          <p className="text-sm text-white/40">{photos.length} photos</p>
        </div>
        <PhotoGrid photos={photos} />
      </main>
    </div>
  )
}

import Link from "next/link"
import AlbumNavbar from "@/components/album-navbar"
import { albumSections } from "@/lib/album-sections"
import { listSectionPhotos } from "@/lib/r2"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const sectionData = await Promise.all(
    albumSections.map(async (section) => {
      const photos = await listSectionPhotos(section.slug, section.r2Prefix)
      return { ...section, count: photos.length, cover: photos[0]?.url }
    }),
  )

  const hiddenSlugs = ["dance-floor", "venue-and-dinner"]
  const visibleSections = sectionData.filter((section) => !hiddenSlugs.includes(section.slug))

  return (
    <div className="min-h-screen bg-[#0E1A24] text-[#F8F3ED]">
      <AlbumNavbar />
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.13),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)]" />
          <div className="container relative mx-auto px-4 py-24 md:py-36">
            <p className="mb-5 text-xs uppercase tracking-[0.38em] text-[#0BE0E6]">Private photo collection</p>
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.98] md:text-8xl">Matric Farewell</h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/55 md:text-lg">
              One evening, five chapters. Choose a section below to view the photographs.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleSections.map((section, index) => (
              <Link
                key={section.slug}
                href={`/gallery/${section.slug}`}
                className={`group relative min-h-[330px] overflow-hidden rounded-3xl border border-[#C7A27D]/25 bg-[#1A2D3D]/80 shadow-[0_20px_60px_rgba(0,0,0,0.22)] ${index === 0 ? "md:col-span-2" : ""}`}
              >
                {section.cover ? (
                  <img src={section.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-500 group-hover:scale-105 group-hover:opacity-80" />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.16),transparent_25%),linear-gradient(145deg,#171717,#050505)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 md:p-8">
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/50">
                    Section {String(index + 1).padStart(2, "0")} · {section.count} photos
                  </p>
                  <h2 className="font-serif text-3xl md:text-4xl">{section.name}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">{section.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

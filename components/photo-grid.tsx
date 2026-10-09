"use client"

import Masonry from "react-masonry-css"
import LightGallery from "lightgallery/react"
import lgZoom from "lightgallery/plugins/zoom"
import "lightgallery/css/lightgallery.css"
import "lightgallery/css/lg-zoom.css"

import type { AlbumPhoto } from "@/lib/r2"

export default function PhotoGrid({ photos }: { photos: AlbumPhoto[] }) {
  if (photos.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-20 text-center text-white/55">
        No photos have been uploaded to this section yet.
      </div>
    )
  }

  const breakpoints = { default: 4, 1200: 3, 800: 2, 520: 1 }

  return (
    <LightGallery speed={350} plugins={[lgZoom]} selector=".album-photo">
      <Masonry
        breakpointCols={breakpoints}
        className="-ml-4 flex w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {photos.map((photo) => (
          <a
            className="album-photo mb-4 block overflow-hidden rounded-2xl bg-white/5 focus:outline-none focus:ring-2 focus:ring-white"
            key={photo.key}
            href={photo.url}
            data-src={photo.url}
            data-sub-html={photo.title ? `<h4>${photo.title}</h4>` : undefined}
          >
            {/* R2 URLs are private signed URLs, so a normal img avoids a public Next Image optimizer cache. */}
            <img
              src={photo.url}
              alt={photo.title || "Matric farewell photograph"}
              loading="lazy"
              className="h-auto w-full transition duration-300 hover:scale-[1.015] hover:opacity-90"
            />
          </a>
        ))}
      </Masonry>
    </LightGallery>
  )
}

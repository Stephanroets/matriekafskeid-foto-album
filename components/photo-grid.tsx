"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Masonry from "react-masonry-css"
import LightGallery from "lightgallery/react"
import lgZoom from "lightgallery/plugins/zoom"
import "lightgallery/css/lightgallery.css"
import "lightgallery/css/lg-zoom.css"

import type { AlbumPhoto } from "@/lib/r2"

export default function PhotoGrid({ photos }: { photos: AlbumPhoto[] }) {
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null)
  const lgInstanceRef = useRef<any>(null)
  const observerRef = useRef<MutationObserver | null>(null)
  const downloadButtonRef = useRef<HTMLButtonElement | null>(null)

  const handleDownload = async (photo: AlbumPhoto, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setDownloadingKey(photo.key)
    
    try {
      const response = await fetch(`/api/download/${encodeURIComponent(photo.key)}`)
      if (!response.ok) {
        throw new Error("Download failed")
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = photo.key.split("/").pop() || photo.key
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download photo. Please try again.")
    } finally {
      setDownloadingKey(null)
    }
  }

  const addDownloadButtonToToolbar = useCallback(() => {
    const toolbar = document.querySelector(".lg-toolbar")
    if (toolbar && !toolbar.querySelector(".lg-download-btn")) {
      const downloadBtn = document.createElement("button")
      downloadBtn.className = "lg-download-btn lg-icon"
      downloadBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      `
      downloadBtn.setAttribute("aria-label", "Download photo")
      downloadBtn.style.cssText = "margin-left: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
      
      downloadBtn.addEventListener("click", () => {
        if (lgInstanceRef.current) {
          const index = lgInstanceRef.current.index
          const photo = photos[index]
          if (photo) {
            handleDownload(photo)
          }
        }
      })
      
      toolbar.appendChild(downloadBtn)
      downloadButtonRef.current = downloadBtn
    }
  }, [photos])

  const onInit = useCallback((detail: any) => {
    lgInstanceRef.current = detail.instance
    
    // Clean up existing observer if any
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    
    // Add the download button immediately if toolbar exists
    addDownloadButtonToToolbar()
    
    // Use a MutationObserver to watch for the toolbar being added
    const observer = new MutationObserver(() => {
      addDownloadButtonToToolbar()
    })
    
    observer.observe(document.body, { childList: true, subtree: true })
    observerRef.current = observer
  }, [addDownloadButtonToToolbar])

  useEffect(() => {
    return () => {
      // Clean up observer on unmount
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      // Clean up download button
      if (downloadButtonRef.current) {
        downloadButtonRef.current.remove()
      }
    }
  }, [])

  if (photos.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-20 text-center text-white/55">
        No photos have been uploaded to this section yet.
      </div>
    )
  }

  const breakpoints = { default: 4, 1200: 3, 800: 2, 520: 1 }

  return (
    <LightGallery 
      onInit={onInit}
      speed={350} 
      plugins={[lgZoom]} 
      selector=".gallery-item"
    >
      <Masonry
        breakpointCols={breakpoints}
        className="-ml-4 flex w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {photos.map((photo) => (
          <div key={photo.key} className="mb-4 relative group">
            <a
              className="gallery-item block overflow-hidden rounded-2xl bg-white/5 focus:outline-none focus:ring-2 focus:ring-white"
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
            <button
              onClick={(e) => handleDownload(photo, e)}
              disabled={downloadingKey === photo.key}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Download photo"
            >
              {downloadingKey === photo.key ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </Masonry>
    </LightGallery>
  )
}

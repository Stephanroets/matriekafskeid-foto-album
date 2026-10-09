"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { albumSections } from "@/lib/album-sections"

export default function UploadForm() {
  const router = useRouter()
  const [section, setSection] = useState<string>(albumSections[0].slug)
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!files.length) return

    setBusy(true)
    setMessage("")

    try {
      let completed = 0
      for (const file of files) {
        const signResponse = await fetch("/api/uploads/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section,
            fileName: file.name,
            contentType: file.type,
          }),
        })

        if (!signResponse.ok) {
          throw new Error((await signResponse.json()).error ?? "Could not prepare upload")
        }

        const { uploadUrl } = await signResponse.json()
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        })

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed for ${file.name}`)
        }

        completed += 1
        setMessage(`Uploaded ${completed} of ${files.length} photo${files.length === 1 ? "" : "s"}…`)
      }

      setMessage(`Done — ${completed} photo${completed === 1 ? "" : "s"} uploaded.`)
      setFiles([])
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
      <div>
        <label htmlFor="section" className="mb-2 block text-sm font-medium text-white/80">
          Album section
        </label>
        <select
          id="section"
          value={section}
          onChange={(event) => setSection(event.target.value)}
          className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white"
        >
          {albumSections.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="photos" className="mb-2 block text-sm font-medium text-white/80">
          Photos
        </label>
        <input
          id="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          className="block w-full rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-8 text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-black"
        />
        <p className="mt-2 text-xs text-white/45">
          Files upload directly from your browser to Cloudflare R2.
        </p>
      </div>

      <button
        type="submit"
        disabled={busy || files.length === 0}
        className="w-full rounded-full bg-white px-5 py-3 font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Uploading…" : `Upload ${files.length || ""} photo${files.length === 1 ? "" : "s"}`}
      </button>

      {message && <p className="text-sm text-white/65">{message}</p>}
    </form>
  )
}

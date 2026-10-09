import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAlbumSection } from "@/lib/album-sections"
import { isAlbumAdmin } from "@/lib/admin"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
])

function safeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 120) || "photo"
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  if (!isAlbumAdmin(data.user.email)) return NextResponse.json({ error: "Not allowed" }, { status: 403 })

  const body = await request.json()
  const section = typeof body.section === "string" ? getAlbumSection(body.section) : undefined
  const fileName = typeof body.fileName === "string" ? body.fileName : ""
  const contentType = typeof body.contentType === "string" ? body.contentType : ""

  if (!section) return NextResponse.json({ error: "Invalid album section" }, { status: 400 })
  if (!ALLOWED_TYPES.has(contentType)) return NextResponse.json({ error: "Unsupported image type" }, { status: 400 })

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET_NAME

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return NextResponse.json({ error: "R2 is not configured" }, { status: 500 })
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })

  const key = `${section.slug}/${crypto.randomUUID()}-${safeFileName(fileName)}`
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 10 * 60 })

  return NextResponse.json({ uploadUrl, key })
}

import { NextRequest, NextResponse } from "next/server"
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"

const IMAGE_EXTENSIONS = /\.(avif|gif|jpe?g|png|webp)$/i

function env(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: env("R2_ENDPOINT"),
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const bucket = env("R2_BUCKET_NAME")

    // Validate the key is an image file
    if (!IMAGE_EXTENSIONS.test(key)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    const client = getR2Client()
    const command = new GetObjectCommand({ Bucket: bucket, Key: key })
    const response = await client.send(command)

    if (!response.Body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Get the filename from the key
    const fileName = key.split("/").pop() || key

    // Convert the stream to a buffer
    const chunks: Uint8Array[] = []
    const stream = response.Body as any
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Get content type from response or default based on extension
    const contentType = response.ContentType || "image/jpeg"

    // Return the file with Content-Disposition: attachment to force download
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json(
      { error: "Failed to download photo" },
      { status: 500 }
    )
  }
}

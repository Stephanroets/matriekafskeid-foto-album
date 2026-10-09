import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
  type _Object,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const IMAGE_EXTENSIONS = /\.(avif|gif|jpe?g|png|webp)$/i

function env(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env("CLOUDFLARE_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  })
}

export type AlbumPhoto = {
  key: string
  url: string
  title: string
  lastModified?: Date
}

export async function listSectionPhotos(sectionSlug: string): Promise<AlbumPhoto[]> {
  const client = getR2Client()
  const bucket = env("R2_BUCKET_NAME")
  const prefix = `${sectionSlug}/`
  const objects: _Object[] = []
  let continuationToken: string | undefined

  do {
    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    )
    objects.push(...(result.Contents ?? []))
    continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined
  } while (continuationToken)

  const images = objects
    .filter((object) => object.Key && IMAGE_EXTENSIONS.test(object.Key))
    .sort((a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0))

  return Promise.all(
    images.map(async (object) => {
      const key = object.Key!
      const url = await getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: bucket, Key: key }),
        { expiresIn: 60 * 60 },
      )

      const fileName = key.split("/").pop() ?? key
      const title = fileName
        .replace(/^[0-9a-f-]{20,}-/i, "")
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")

      return { key, url, title, lastModified: object.LastModified }
    }),
  )
}

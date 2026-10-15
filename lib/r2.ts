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

const R2_ENVIRONMENT_VARIABLES = [
  "CLOUDFLARE_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
] as const

export function isR2Configured() {
  return R2_ENVIRONMENT_VARIABLES.every((name) => Boolean(process.env[name]))
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

export type AlbumPhoto = {
  key: string
  url: string
  title: string
  lastModified?: Date
}

export async function listSectionPhotos(sectionSlug: string, r2Prefix?: string): Promise<AlbumPhoto[]> {
  if (!isR2Configured()) return []

  const client = getR2Client()
  const bucket = env("R2_BUCKET_NAME")
  const prefix = r2Prefix ? `${r2Prefix}/` : `${sectionSlug}/`
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
    .sort((a, b) => {
      // Natural sort by filename for stable chronological ordering
      const keyA = a.Key ?? ""
      const keyB = b.Key ?? ""
      const nameA = keyA.split("/").pop() ?? keyA
      const nameB = keyB.split("/").pop() ?? keyB
      
      // Natural sort: handles photo1, photo2, photo10 correctly
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" })
    })

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

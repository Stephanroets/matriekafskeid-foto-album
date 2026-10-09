export function isAlbumAdmin(email?: string | null) {
  if (!email) return false

  const allowed = (process.env.ALBUM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return allowed.includes(email.toLowerCase())
}

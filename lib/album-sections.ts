export const albumSections = [
  {
    slug: "matric-farewell",
    name: "Matric Farewell Photos",
    description: "Photographs from the matric farewell evening.",
    r2Prefix: "1-1/pics",
  },
  {
    slug: "arrivals",
    name: "Arrivals",
    description: "Cars and entrances.",
    r2Prefix: "arrivals",
  },
  {
    slug: "portraits",
    name: "Portraits",
    description: "Individual portraits and formal photographs.",
    r2Prefix: "portraits",
  },
  {
    slug: "friends-and-couples",
    name: "Family Photos Before Event",
    description: "Family photographs captured before the event began.",
    r2Prefix: "friends-and-couples",
  },
  {
    slug: "venue-and-dinner",
    name: "Venue & Dinner",
    description: "Decor, tables, dinner and moments around the venue.",
    r2Prefix: "venue-and-dinner",
  },
  {
    slug: "dance-floor",
    name: "Dance Floor",
    description: "Dancing, celebration and the late-night highlights.",
    r2Prefix: "dance-floor",
  },
] as const

export type AlbumSection = (typeof albumSections)[number]

export function getAlbumSection(slug: string) {
  return albumSections.find((section) => section.slug === slug)
}

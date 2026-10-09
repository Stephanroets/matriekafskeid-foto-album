export const albumSections = [
  {
    slug: "arrivals",
    name: "Arrivals",
    description: "Cars, entrances, first looks and the start of the evening.",
  },
  {
    slug: "portraits",
    name: "Portraits",
    description: "Individual portraits and formal photographs.",
  },
  {
    slug: "friends-and-couples",
    name: "Friends & Couples",
    description: "Friends, couples and group photographs together.",
  },
  {
    slug: "venue-and-dinner",
    name: "Venue & Dinner",
    description: "Decor, tables, dinner and moments around the venue.",
  },
  {
    slug: "dance-floor",
    name: "Dance Floor",
    description: "Dancing, celebration and the late-night highlights.",
  },
] as const

export type AlbumSection = (typeof albumSections)[number]

export function getAlbumSection(slug: string) {
  return albumSections.find((section) => section.slug === slug)
}

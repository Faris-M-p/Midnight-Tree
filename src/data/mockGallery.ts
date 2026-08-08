export interface MockPhoto {
  id: string;
  url: string;
  caption: string;
  takenOn: string;
  relatedMemberIds: string[];
}

export interface MockAlbum {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  createdOn: string;
  photos: MockPhoto[];
}

export const mockAlbums: MockAlbum[] = [
  {
    id: "album-1",
    title: "Kerala Summers",
    description: "The ancestral home, courtyard gatherings, and monsoon evenings.",
    coverUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&h=600&fit=crop",
    createdOn: "2024-05-02",
    photos: [
      {
        id: "p1",
        url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=800&fit=crop",
        caption: "Family lunch on the verandah",
        takenOn: "2024-04-14",
        relatedMemberIds: ["ramesh", "savita", "rajesh"]
      },
      {
        id: "p2",
        url: "https://images.unsplash.com/photo-1464306208223-e0b4495a5553?w=1200&h=800&fit=crop",
        caption: "Savita’s kitchen",
        takenOn: "2024-04-15",
        relatedMemberIds: ["savita"]
      },
      {
        id: "p3",
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop",
        caption: "Pepper vines at dusk",
        takenOn: "2024-04-16",
        relatedMemberIds: ["suresh"]
      }
    ]
  },
  {
    id: "album-2",
    title: "Weddings",
    description: "Rajesh & Kavita, Amit & Pooja, and the celebrations in between.",
    coverUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=600&fit=crop",
    createdOn: "2023-12-01",
    photos: [
      {
        id: "p4",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop",
        caption: "Amit and Pooja, Bengaluru",
        takenOn: "2023-11-18",
        relatedMemberIds: ["amit", "pooja"]
      },
      {
        id: "p5",
        url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&h=800&fit=crop",
        caption: "Garlands and monsoon light",
        takenOn: "2023-11-18",
        relatedMemberIds: ["amit", "pooja", "rajesh"]
      }
    ]
  },
  {
    id: "album-3",
    title: "Little Ones",
    description: "Aarav, Ananya, and Diya growing up in real time.",
    coverUrl: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=900&h=600&fit=crop",
    createdOn: "2025-01-10",
    photos: [
      {
        id: "p6",
        url: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=1200&h=800&fit=crop",
        caption: "Ananya’s first Diwali",
        takenOn: "2025-10-20",
        relatedMemberIds: ["ananya"]
      },
      {
        id: "p7",
        url: "https://images.unsplash.com/photo-1519689680058-324335c77ebe?w=1200&h=800&fit=crop",
        caption: "Cousins at Holi",
        takenOn: "2026-03-14",
        relatedMemberIds: ["aarav", "ananya", "diya"]
      }
    ]
  }
];

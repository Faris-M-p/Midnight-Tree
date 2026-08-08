export interface MockStory {
  id: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  images: string[];
  relatedMemberIds: string[];
  relatedEventIds: string[];
  date: string;
  author: string;
  status: "draft" | "published" | "unpublished";
}

export const mockStories: MockStory[] = [
  {
    id: "story-1",
    title: "Summer at the Ancestral Home",
    description: "Three generations under one Kerala roof, mangoes in the courtyard, and Savita’s Carnatic evenings.",
    content:
      "Every April the Mehtas return to Thiruvananthapuram. The verandah fills with cousins, the kitchen never sleeps, and Ramesh still tells the same bridge-building stories — only now Aarav and Ananya sit on his lap.",
    coverImage: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=700&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1464306208223-e0b4495a5553?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop"
    ],
    relatedMemberIds: ["ramesh", "savita", "rajesh"],
    relatedEventIds: ["event-3"],
    date: "2025-04-12",
    author: "Kavita Sharma",
    status: "published"
  },
  {
    id: "story-2",
    title: "Amit & Pooja’s Bengaluru Wedding",
    description: "A garden ceremony, monsoon clouds, and the first chapter of the fourth generation’s parents.",
    content:
      "Friends from NIT Trichy filled the lawn. Rajesh gave a toast that made Savita cry. The family still talks about the jasmine, the rain that held off until the last dance, and how quickly Aarav arrived the following year.",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=700&fit=crop",
    images: ["https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop"],
    relatedMemberIds: ["amit", "pooja"],
    relatedEventIds: ["event-2"],
    date: "2023-11-18",
    author: "Rahul Mehta",
    status: "published"
  },
  {
    id: "story-3",
    title: "Haritha Collective",
    description: "Suresh leaves corporate agronomy to grow an organic farm that now feeds three villages.",
    content:
      "The first harvest was small. The second fed neighbors. Today Haritha is a teaching farm — and Suresh still writes his Sunday column from a desk facing the pepper vines.",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=700&fit=crop",
    images: ["https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop"],
    relatedMemberIds: ["suresh"],
    relatedEventIds: [],
    date: "2012-06-01",
    author: "Suresh Mehta",
    status: "published"
  },
  {
    id: "story-4",
    title: "Draft: Diya’s First Recital",
    description: "Notes from last month’s school concert — not published yet.",
    content: "Still gathering photos from Kavita and Pooja before we share this with the wider family.",
    coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=700&fit=crop",
    images: [],
    relatedMemberIds: ["diya"],
    relatedEventIds: [],
    date: "2026-07-20",
    author: "Kavita Sharma",
    status: "draft"
  }
];

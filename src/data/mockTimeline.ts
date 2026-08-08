export type TimelineCategory =
  | "birth"
  | "marriage"
  | "education"
  | "career"
  | "migration"
  | "achievement"
  | "death"
  | "family-event";

export interface MockTimelineItem {
  id: string;
  year: number;
  title: string;
  description: string;
  category: TimelineCategory;
  memberName: string;
  memberId?: string;
}

export const mockTimeline: MockTimelineItem[] = [
  { id: "t1", year: 1945, title: "Birth", description: "Ramesh Mehta is born in Kerala.", category: "birth", memberName: "Ramesh Mehta", memberId: "ramesh" },
  { id: "t2", year: 1950, title: "Birth", description: "Savita is born; she will later become the family’s Sanskrit scholar.", category: "birth", memberName: "Savita Mehta", memberId: "savita" },
  { id: "t3", year: 1967, title: "Education", description: "Ramesh graduates in Civil Engineering from CEG.", category: "education", memberName: "Ramesh Mehta", memberId: "ramesh" },
  { id: "t4", year: 1969, title: "Marriage", description: "Ramesh and Savita marry in Thiruvananthapuram.", category: "marriage", memberName: "Ramesh & Savita" },
  { id: "t5", year: 1973, title: "Child Born", description: "Suresh, the first son, is born.", category: "birth", memberName: "Suresh Mehta", memberId: "suresh" },
  { id: "t6", year: 1975, title: "Child Born", description: "Rajesh is born, completing the second generation.", category: "birth", memberName: "Rajesh Mehta", memberId: "rajesh" },
  { id: "t7", year: 1988, title: "Family Migration", description: "Rajesh moves to Pune for medical training.", category: "migration", memberName: "Rajesh Mehta", memberId: "rajesh" },
  { id: "t8", year: 2000, title: "Marriage", description: "Rajesh marries Kavita Sharma in Mumbai.", category: "marriage", memberName: "Rajesh & Kavita" },
  { id: "t9", year: 2005, title: "Family Achievement", description: "Mehta Childcare Center opens in Pune.", category: "achievement", memberName: "Rajesh Mehta", memberId: "rajesh" },
  { id: "t10", year: 2012, title: "Career", description: "Suresh founds Haritha Organic Collective.", category: "career", memberName: "Suresh Mehta", memberId: "suresh" },
  { id: "t11", year: 2015, title: "Family Achievement", description: "First all-family reunion spanning four cities.", category: "family-event", memberName: "Mehta Family" },
  { id: "t12", year: 2023, title: "Marriage", description: "Amit and Pooja marry in Bengaluru.", category: "marriage", memberName: "Amit & Pooja" },
  { id: "t13", year: 2023, title: "Child Born", description: "Aarav arrives — fourth generation.", category: "birth", memberName: "Aarav Mehta", memberId: "aarav" },
  { id: "t14", year: 2024, title: "Child Born", description: "Ananya is born.", category: "birth", memberName: "Ananya Mehta", memberId: "ananya" }
];

/** Display names for mock modules (stories, events, tokens). Real members come from the tree API. */

export interface MockMemberRef {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  relationship: string;
  dob: string;
  lifeStatus: "alive" | "deceased";
  location: string;
  photo: string;
}

export const mockMembers: MockMemberRef[] = [
  { id: "ramesh", firstName: "Ramesh", lastName: "Mehta", nickname: "Appa", relationship: "Root", dob: "1945-08-15", lifeStatus: "alive", location: "Thiruvananthapuram", photo: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200&h=200&fit=crop" },
  { id: "savita", firstName: "Savita", lastName: "Mehta", nickname: "Amma", relationship: "Spouse", dob: "1950-03-02", lifeStatus: "alive", location: "Thiruvananthapuram", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop" },
  { id: "suresh", firstName: "Suresh", lastName: "Mehta", nickname: "Suri", relationship: "Child", dob: "1973-06-11", lifeStatus: "alive", location: "Kerala", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" },
  { id: "rajesh", firstName: "Rajesh", lastName: "Mehta", nickname: "Raju", relationship: "Child", dob: "1975-08-18", lifeStatus: "alive", location: "Pune", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
  { id: "kavita", firstName: "Kavita", lastName: "Sharma", nickname: "Kavi", relationship: "Spouse", dob: "1978-01-22", lifeStatus: "alive", location: "Pune", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" },
  { id: "amit", firstName: "Amit", lastName: "Mehta", relationship: "Child", dob: "1998-04-09", lifeStatus: "alive", location: "Bengaluru", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop" },
  { id: "pooja", firstName: "Pooja", lastName: "Mehta", relationship: "Spouse", dob: "1999-09-14", lifeStatus: "alive", location: "Bengaluru", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop" },
  { id: "rahul", firstName: "Rahul", lastName: "Mehta", relationship: "Child", dob: "2002-12-01", lifeStatus: "alive", location: "Pune", photo: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&h=200&fit=crop" },
  { id: "aarav", firstName: "Aarav", lastName: "Mehta", relationship: "Child", dob: "2023-08-02", lifeStatus: "alive", location: "Bengaluru", photo: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop" },
  { id: "ananya", firstName: "Ananya", lastName: "Mehta", relationship: "Child", dob: "2024-11-20", lifeStatus: "alive", location: "Bengaluru", photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop" },
  { id: "diya", firstName: "Diya", lastName: "Mehta", relationship: "Child", dob: "2016-05-08", lifeStatus: "alive", location: "Pune", photo: "https://images.unsplash.com/photo-1471286174890-9c112ffca5ba?w=200&h=200&fit=crop" }
];

export function mockMemberName(id: string) {
  const member = mockMembers.find((m) => m.id === id);
  return member ? `${member.firstName} ${member.lastName}` : id;
}

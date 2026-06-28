export interface FamilyMember {
  id: string;
  name: string;
  relation:
    | 'Grandfather'
    | 'Grandmother'
    | 'Father'
    | 'Mother'
    | 'Uncle'
    | 'Brother'
    | 'Sister-in-Law'
    | 'Me'
    | 'Nephew'
    | 'Niece';
  gender: 'male' | 'female';
  dob: string;
  location: string;
  profession: string;
  avatar: string;
  bio: string;
  education: string;
  career: string;
  photos: string[];
  isDeceased?: boolean;
  socials?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    gmail?: string;
  };
}

export interface MarriageUnion {
  id: string;
  spouse1Id: string;
  spouse2Id: string;
  childrenIds: string[];
}

export interface Milestone {
  id: string;
  year: number;
  title: string;
  description: string;
  memberId: string;
  memberName: string;
  category: 'birth' | 'marriage' | 'career' | 'education' | 'other';
}

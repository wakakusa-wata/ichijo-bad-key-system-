
export interface Member {
  id: string;
  name: string;
}

export type KeyType = 'clubhouse' | 'gym' | 'other';

export interface SelectionRecord {
  id: string;
  memberId: string;
  memberName: string;
  keyType: KeyType;
  timestamp: number;
}

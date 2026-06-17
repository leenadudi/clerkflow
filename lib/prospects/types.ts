export type ProspectStatus =
  | "not_contacted"
  | "contacted"
  | "replied"
  | "demo_scheduled"
  | "passed";

export type Prospect = {
  id: string;
  townName: string;
  state: string;
  population: number | null;
  clerkName: string;
  email: string | null;
  contactInfo: string | null;
  notes: string;
  status: ProspectStatus;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProspectInput = {
  townName: string;
  state: string;
  population?: number | null;
  clerkName: string;
  email?: string | null;
  contactInfo?: string | null;
  notes?: string;
};

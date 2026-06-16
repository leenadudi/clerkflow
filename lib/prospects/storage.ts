import { promises as fs } from "fs";
import path from "path";
import type { CreateProspectInput, Prospect, ProspectStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "prospects.json");

async function ensureStore(): Promise<Prospect[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Prospect[];
  } catch {
    const seed = defaultProspects();
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
}

function defaultProspects(): Prospect[] {
  const now = new Date().toISOString();
  return [
    {
      id: "demo-riverside-oh",
      townName: "Riverside",
      state: "OH",
      population: 1200,
      clerkName: "Jane Miller",
      email: "clerk@riverside-oh.example",
      phone: null,
      notes: "Example row — replace with real prospect from league list.",
      status: "not_contacted",
      lastContactedAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

async function save(prospects: Prospect[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(prospects, null, 2));
}

export async function listProspects(): Promise<Prospect[]> {
  return ensureStore();
}

export async function getProspect(id: string): Promise<Prospect | null> {
  const prospects = await ensureStore();
  return prospects.find((p) => p.id === id) ?? null;
}

export async function createProspect(input: CreateProspectInput): Promise<Prospect> {
  const prospects = await ensureStore();
  const now = new Date().toISOString();
  const prospect: Prospect = {
    id: crypto.randomUUID(),
    townName: input.townName.trim(),
    state: input.state.trim().toUpperCase(),
    population: input.population ?? null,
    clerkName: input.clerkName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    notes: input.notes?.trim() || "",
    status: "not_contacted",
    lastContactedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  prospects.push(prospect);
  await save(prospects);
  return prospect;
}

export async function updateProspectStatus(
  id: string,
  status: ProspectStatus,
  lastContactedAt?: string | null,
): Promise<Prospect | null> {
  const prospects = await ensureStore();
  const index = prospects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  prospects[index] = {
    ...prospects[index],
    status,
    lastContactedAt: lastContactedAt ?? prospects[index].lastContactedAt,
    updatedAt: new Date().toISOString(),
  };
  await save(prospects);
  return prospects[index];
}

export async function listNotContacted(): Promise<Prospect[]> {
  const prospects = await ensureStore();
  return prospects.filter((p) => p.status === "not_contacted");
}

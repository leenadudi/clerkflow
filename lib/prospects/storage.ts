import { promises as fs } from "fs";
import path from "path";
import { isDatabaseConfigured } from "@/lib/db";
import {
  createProspectInDb,
  getProspectFromDb,
  importProspectsToDb,
  listNotContactedFromDb,
  listProspectsFromDb,
  updateProspectStatusInDb,
} from "./db";
import type { CreateProspectInput, Prospect, ProspectStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "prospects.json");

let dbBootstrapped = false;

function normalizeProspect(raw: Prospect & { phone?: string | null }): Prospect {
  const { phone, ...rest } = raw
  return {
    ...rest,
    contactInfo: rest.contactInfo ?? phone ?? null,
  }
}

async function bootstrapProspectsDb(): Promise<void> {
  if (dbBootstrapped) return;
  dbBootstrapped = true;

  const existing = await listProspectsFromDb();
  if (existing.length > 0) return;

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const fromFile = (
      JSON.parse(raw) as Array<Prospect & { phone?: string | null }>
    ).map(normalizeProspect);
    const imported = await importProspectsToDb(fromFile);
    if (imported > 0) {
      console.log(`Imported ${imported} prospect(s) from data/prospects.json into Neon.`);
    }
  } catch {
    const seed = defaultProspects();
    await importProspectsToDb(seed);
  }
}

async function ensureFileStore(): Promise<Prospect[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return (JSON.parse(raw) as Array<Prospect & { phone?: string | null }>).map(
      normalizeProspect,
    );
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
      contactInfo: null,
      notes: "Example row — replace with real prospect from league list.",
      status: "not_contacted",
      lastContactedAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

async function saveToFile(prospects: Prospect[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(prospects, null, 2));
}

export async function listProspects(): Promise<Prospect[]> {
  if (isDatabaseConfigured()) {
    await bootstrapProspectsDb();
    return listProspectsFromDb();
  }
  return ensureFileStore();
}

export async function getProspect(id: string): Promise<Prospect | null> {
  if (isDatabaseConfigured()) {
    await bootstrapProspectsDb();
    return getProspectFromDb(id);
  }
  const prospects = await ensureFileStore();
  return prospects.find((p) => p.id === id) ?? null;
}

export async function createProspect(input: CreateProspectInput): Promise<Prospect> {
  if (isDatabaseConfigured()) {
    await bootstrapProspectsDb();
    return createProspectInDb(input);
  }

  const prospects = await ensureFileStore();
  const now = new Date().toISOString();
  const prospect: Prospect = {
    id: crypto.randomUUID(),
    townName: input.townName.trim(),
    state: input.state.trim().toUpperCase(),
    population: input.population ?? null,
    clerkName: input.clerkName.trim(),
    email: input.email?.trim().toLowerCase() || null,
    contactInfo: input.contactInfo?.trim() || null,
    notes: input.notes?.trim() || "",
    status: "not_contacted",
    lastContactedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  prospects.push(prospect);
  await saveToFile(prospects);
  return prospect;
}

export async function updateProspectStatus(
  id: string,
  status: ProspectStatus,
  lastContactedAt?: string | null,
): Promise<Prospect | null> {
  if (isDatabaseConfigured()) {
    await bootstrapProspectsDb();
    return updateProspectStatusInDb(id, status, lastContactedAt);
  }

  const prospects = await ensureFileStore();
  const index = prospects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  prospects[index] = {
    ...prospects[index],
    status,
    lastContactedAt: lastContactedAt ?? prospects[index].lastContactedAt,
    updatedAt: new Date().toISOString(),
  };
  await saveToFile(prospects);
  return prospects[index];
}

export async function listNotContacted(): Promise<Prospect[]> {
  if (isDatabaseConfigured()) {
    await bootstrapProspectsDb();
    return listNotContactedFromDb();
  }
  const prospects = await ensureFileStore();
  return prospects.filter((p) => p.status === "not_contacted");
}

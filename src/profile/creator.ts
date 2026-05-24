import { readMarkdownFile, writeMarkdownFile, readJsonFile, writeJsonFile, listDirectories, ensureDir } from "../utils/fileSystem.js";
import { loadManifest, saveManifest } from "../hive/manifest.js";
import path from "path";

export interface ProfileIdentity {
  name: string;
  description: string;
  personality: string;
  capabilities: string[];
}

export interface Profile {
  name: string;
  identity: ProfileIdentity;
  projects: string[];
  isLeader: boolean;
}

export async function createProfile(hivePath: string, profileName: string, options?: {
  description?: string;
  projects?: string[];
}): Promise<void> {
  const profileDir = path.join(hivePath, "profiles", profileName);
  await ensureDir(profileDir);

  await writeMarkdownFile(
    path.join(profileDir, "identity.md"),
    "# " + profileName + "\n\n" + (options?.description || "Profile in hive")
  );

  await writeJsonFile(
    path.join(profileDir, "projects.json"),
    options?.projects || []
  );

  await writeMarkdownFile(
    path.join(profileDir, "system-prompt.md"),
    "You are " + profileName + ", a profile in the Meta-Hive."
  );

  // Update manifest
  const manifest = await loadManifest(hivePath);
  if (manifest && !manifest.profiles.includes(profileName)) {
    manifest.profiles.push(profileName);
    await saveManifest(hivePath, manifest);
  }
}

export async function getProfile(hivePath: string, profileName: string): Promise<Profile | null> {
  const profileDir = path.join(hivePath, "profiles", profileName);

  try {
    const identityContent = await readMarkdownFile(path.join(profileDir, "identity.md"));
    const projectsContent = await readJsonFile(path.join(profileDir, "projects.json")) as string[];

    return {
      name: profileName,
      identity: {
        name: profileName,
        description: identityContent.replace("# " + profileName, "").trim(),
        personality: "",
        capabilities: [],
      },
      projects: projectsContent || [],
      isLeader: false,
    };
  } catch {
    return null;
  }
}

export async function getAllProfiles(hivePath: string): Promise<Profile[]> {
  const profilesDir = path.join(hivePath, "profiles");
  const profileNames = await listDirectories(profilesDir);

  const profiles: Profile[] = [];

  for (const profileName of profileNames) {
    const profile = await getProfile(hivePath, profileName);
    if (profile) {
      profiles.push(profile);
    }
  }

  return profiles;
}
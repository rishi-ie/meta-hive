import { HiveManifest } from '../types/index.js';
import { readJsonFile, writeJsonFile, fileExists } from '../utils/fileSystem.js';
import path from 'path';

const MANIFEST_FILENAME = '.hive-manifest.json';

export async function getManifestPath(hivePath: string): Promise<string> {
  return path.join(hivePath, MANIFEST_FILENAME);
}

export async function loadManifest(hivePath: string): Promise<HiveManifest | null> {
  const manifestPath = await getManifestPath(hivePath);
  if (!(await fileExists(manifestPath))) {
    return null;
  }
  return readJsonFile<HiveManifest>(manifestPath);
}

export async function createManifest(hivePath: string, leader: string): Promise<HiveManifest> {
  const manifest: HiveManifest = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    leader,
    profiles: [leader],
  };

  const manifestPath = await getManifestPath(hivePath);
  await writeJsonFile(manifestPath, manifest);

  return manifest;
}

export async function updateManifest(
  hivePath: string,
  updates: Partial<Omit<HiveManifest, 'version' | 'createdAt'>>
): Promise<HiveManifest> {
  const manifest = await loadManifest(hivePath);
  if (!manifest) {
    throw new Error('Manifest not found. Run init first.');
  }

  const updatedManifest: HiveManifest = {
    ...manifest,
    ...updates,
    profiles: updates.profiles ?? manifest.profiles,
    leader: updates.leader ?? manifest.leader,
  };

  const manifestPath = await getManifestPath(hivePath);
  await writeJsonFile(manifestPath, updatedManifest);

  return updatedManifest;
}

export async function addProfileToManifest(hivePath: string, profileName: string): Promise<void> {
  const manifest = await loadManifest(hivePath);
  if (!manifest) {
    throw new Error('Manifest not found.');
  }

  if (!manifest.profiles.includes(profileName)) {
    manifest.profiles.push(profileName);
    const manifestPath = await getManifestPath(hivePath);
    await writeJsonFile(manifestPath, manifest);
  }
}

export async function removeProfileFromManifest(hivePath: string, profileName: string): Promise<void> {
  const manifest = await loadManifest(hivePath);
  if (!manifest) {
    throw new Error('Manifest not found.');
  }

  manifest.profiles = manifest.profiles.filter(p => p !== profileName);
  const manifestPath = await getManifestPath(hivePath);
  await writeJsonFile(manifestPath, manifest);
}

export async function getLeaderFromManifest(hivePath: string): Promise<string | null> {
  const manifest = await loadManifest(hivePath);
  return manifest?.leader ?? null;
}
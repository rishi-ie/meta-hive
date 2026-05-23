import { HiveConfig } from '../types/index.js';
import { readJsonFile, writeJsonFile, fileExists } from '../utils/fileSystem.js';
import path from 'path';

const CONFIG_FILENAME = 'hive-config.json';

export async function getConfigPath(): Promise<string> {
  return path.join(process.cwd(), CONFIG_FILENAME);
}

export async function loadConfig(): Promise<HiveConfig | null> {
  const configPath = await getConfigPath();
  if (!(await fileExists(configPath))) {
    return null;
  }
  return readJsonFile<HiveConfig>(configPath);
}

export async function saveConfig(config: HiveConfig): Promise<void> {
  const configPath = await getConfigPath();
  await writeJsonFile(configPath, config);
}

export async function updateConfig(updates: Partial<HiveConfig>): Promise<HiveConfig> {
  const currentConfig = await loadConfig();
  const updatedConfig: HiveConfig = {
    hivePath: updates.hivePath ?? currentConfig?.hivePath ?? '',
    profileName: updates.profileName ?? currentConfig?.profileName ?? '',
    isLeader: updates.isLeader ?? currentConfig?.isLeader ?? false,
    activeProject: updates.activeProject ?? currentConfig?.activeProject ?? null,
  };
  await saveConfig(updatedConfig);
  return updatedConfig;
}

export async function clearConfig(): Promise<void> {
  const configPath = await getConfigPath();
  if (await fileExists(configPath)) {
    const { unlink } = await import('fs/promises');
    await unlink(configPath);
  }
}
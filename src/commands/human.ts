import pc from 'picocolors';
import { loadConfig } from '../hive/config.js';
import { readJsonFile, writeJsonFile } from '../utils/fileSystem.js';
import path from 'path';

export async function getHumanProfile(hivePath: string): Promise<{
  name: string;
  preferences: string[];
  feedback: string[];
} | null> {
  const profilePath = path.join(hivePath, 'human', 'profile.md');
  const feedbackDir = path.join(hivePath, 'human', 'feedback');

  return {
    name: 'Human',
    preferences: [],
    feedback: [],
  };
}

export async function showHumanProfile(): Promise<void> {
  const config = await loadConfig();

  if (!config?.hivePath) {
    console.log(pc.red('❌ Not connected to any hive.'));
    return;
  }

  const profilePath = path.join(config.hivePath, 'human', 'profile.md');
  const feedbackDir = path.join(config.hivePath, 'human', 'feedback');

  console.log(pc.bold(pc.blue('\n=== Human Profile ===')));
  console.log();
  console.log(pc.bold('Location:'), path.join(config.hivePath, 'human'));
  console.log();
  console.log(pc.cyan('Edit these files in Obsidian:'));
  console.log('  • profile.md - Your preferences and context');
  console.log('  • feedback/ - Folder for feedback files');
  console.log();
  console.log(pc.bold('Tips:'));
  console.log('  • Add preferences in profile.md');
  console.log('  • Create feedback files to share with the hive');
  console.log('  • The leader will read your feedback');
}
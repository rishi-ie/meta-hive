import pc from 'picocolors';
import { createManifest, addProfileToManifest } from '../hive/manifest.js';
import { createProfile, getProfileDirectory } from '../profile/creator.js';
import { updateConfig } from '../hive/config.js';
import { fileExists, mkdir, writeMarkdownFile } from '../utils/fileSystem.js';
import path from 'path';

export interface InitOptions {
  hiveName?: string;
  profileName?: string;
  isLeader?: boolean;
}

export async function initHive(options: InitOptions = {}): Promise<void> {
  const { hiveName = '.meta-hive', profileName = 'leader', isLeader = true } = options;

  const hivePath = path.resolve(hiveName);

  // Check if hive already exists
  if (await fileExists(path.join(hivePath, '.hive-manifest.json'))) {
    console.log(pc.yellow(`⚠ Hive already exists at ${hivePath}`));
    console.log(pc.gray('  Use `/meta-hive join` to join an existing hive.'));
    return;
  }

  console.log(pc.blue('🚀 Initializing Meta-Hive...'));
  console.log();

  // Create hive directory structure
  await mkdir(hivePath, { recursive: true });
  await mkdir(path.join(hivePath, 'profiles'), { recursive: true });
  await mkdir(path.join(hivePath, 'projects'), { recursive: true });
  await mkdir(path.join(hivePath, 'human', 'feedback'), { recursive: true });
  await mkdir(path.join(hivePath, 'shared', 'skills'), { recursive: true });
  await mkdir(path.join(hivePath, 'shared', 'learnings'), { recursive: true });

  // Create human profile template
  const humanProfileContent = `# Human Profile

## Name
[Your name]

## Preferences
- [List your coding preferences]
- [List your communication preferences]

## Context
[Any relevant context about you]

## Notes
[Additional notes for the hive]
`;
  await writeMarkdownFile(path.join(hivePath, 'human', 'profile.md'), humanProfileContent);

  // Create leader profile
  const leaderIdentity = {
    name: profileName,
    description: 'Leader of the Meta-Hive. Orchestrates all profiles and provides insights to the human.',
    personality: 'Wise, organized, and helpful. Coordinates the hive\'s activities.',
    capabilities: ['Meta capabilities', 'Hive orchestration', 'Cross-profile memory synthesis', 'Insight generation'],
  };

  await createProfile({
    hivePath,
    profileName,
    isLeader: true,
    identity: leaderIdentity,
  });

  // Create manifest
  const manifest = await createManifest(hivePath, profileName);

  // Save config
  await updateConfig({
    hivePath,
    profileName,
    isLeader,
    activeProject: null,
  });

  console.log(pc.green('✅ Hive created successfully!'));
  console.log();
  console.log(pc.bold('Hive Structure:'));
  console.log(`  ${pc.gray(hivePath)}/`);
  console.log(`    ├── .hive-manifest.json`);
  console.log(`    ├── ${profileName}/ (leader)`);
  console.log(`    ├── profiles/`);
  console.log(`    ├── projects/`);
  console.log(`    ├── human/`);
  console.log(`    └── shared/`);
  console.log();
  console.log(pc.green(`Leader profile: ${profileName}`));
  console.log();
  console.log(pc.cyan('Next steps:'));
  console.log('  1. Open this folder in Obsidian to view the hive');
  console.log('  2. Create new profiles with: meta-hive join <path>');
  console.log('  3. Run: meta-hive status');
}
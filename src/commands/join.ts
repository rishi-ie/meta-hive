import pc from 'picocolors';
import { loadManifest, addProfileToManifest } from '../hive/manifest.js';
import { createProfile } from '../profile/creator.js';
import { updateConfig } from '../hive/config.js';
import { fileExists, mkdir } from '../utils/fileSystem.js';
import path from 'path';

export interface JoinOptions {
  hivePath: string;
  profileName: string;
  identity?: string;
  projects?: string[];
}

export async function joinHive(options: JoinOptions): Promise<void> {
  const { hivePath: inputPath, profileName, identity, projects = [] } = options;

  const hivePath = path.resolve(inputPath);

  // Verify hive exists
  const manifest = await loadManifest(hivePath);
  if (!manifest) {
    console.log(pc.red(`❌ No hive found at ${hivePath}`));
    console.log(pc.gray('  Run `meta-hive init` first to create a hive.'));
    return;
  }

  // Check if profile already exists
  if (manifest.profiles.includes(profileName)) {
    console.log(pc.yellow(`⚠ Profile "${profileName}" already exists in the hive.`));
    console.log(pc.gray('  Update your config to connect as this profile.'));
    await updateConfig({
      hivePath,
      profileName,
      isLeader: false,
      activeProject: null,
    });
    return;
  }

  console.log(pc.blue('🔗 Joining Meta-Hive...'));
  console.log();

  // Create profile directories
  await mkdir(path.join(hivePath, 'profiles', profileName), { recursive: true });

  // Create profile identity
  const profileIdentity = {
    name: profileName,
    description: identity || `A coding agent profile in the ${hivePath} hive.`,
    personality: 'Diligent and helpful. Works on assigned projects.',
    capabilities: ['Coding assistance', 'Project work'],
  };

  await createProfile({
    hivePath,
    profileName,
    isLeader: false,
    identity: profileIdentity,
    projects,
  });

  // Register in manifest
  await addProfileToManifest(hivePath, profileName);

  // Save config
  await updateConfig({
    hivePath,
    profileName,
    isLeader: false,
    activeProject: projects[0] || null,
  });

  console.log(pc.green('✅ Successfully joined the hive!'));
  console.log();
  console.log(pc.bold('Your Profile:'));
  console.log(`  ${pc.cyan(profileName)}`);
  console.log(`  Hive: ${hivePath}`);
  console.log();
  if (projects.length > 0) {
    console.log(`  Projects: ${projects.join(', ')}`);
  }
  console.log();
  console.log(pc.cyan('Next steps:'));
  console.log('  1. Open the hive folder in Obsidian to see your profile');
  console.log('  2. Run: meta-hive status');
  console.log('  3. Start working on your projects!');
}
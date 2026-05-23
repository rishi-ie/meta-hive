import pc from 'picocolors';
import { loadManifest } from '../hive/manifest.js';
import { getAllProfiles } from '../profile/creator.js';
import { loadConfig } from '../hive/config.js';

export async function showProfiles(): Promise<void> {
  const config = await loadConfig();

  if (!config?.hivePath) {
    console.log(pc.red('❌ Not connected to any hive.'));
    return;
  }

  const hivePath = config.hivePath;

  const manifest = await loadManifest(hivePath);
  if (!manifest) {
    console.log(pc.red(`❌ No hive found at ${hivePath}`));
    return;
  }

  const profiles = await getAllProfiles(hivePath);

  console.log(pc.bold(pc.blue('\n=== Hive Profiles ===')));
  console.log();
  console.log(pc.bold('Leader:'), pc.cyan(manifest.leader));
  console.log();

  console.log(pc.bold(`All Profiles (${manifest.profiles.length}):`));
  console.log();

  for (const profileName of manifest.profiles) {
    const profile = profiles.find(p => p.name === profileName);
    const isLeader = profileName === manifest.leader;
    const isCurrent = profileName === config.profileName;

    // Profile header
    let badge = '';
    if (isLeader) badge = pc.yellow(' [LEADER]');
    if (isCurrent) badge += pc.green(' (current)');

    console.log(pc.bold(`${isLeader ? '👑' : '🤖'} ${profileName}${badge}`));

    // Details
    if (profile) {
      console.log(pc.gray(`   Description: ${profile.identity.description}`));

      if (profile.identity.capabilities && profile.identity.capabilities.length > 0) {
        console.log(pc.gray(`   Capabilities: ${profile.identity.capabilities.join(', ')}`));
      }

      if (profile.projects.length > 0) {
        console.log(pc.gray(`   Projects: ${profile.projects.join(', ')}`));
      } else {
        console.log(pc.gray('   Projects: None assigned'));
      }

      if (profile.identity.personality) {
        console.log(pc.gray(`   Personality: ${profile.identity.personality}`));
      }
    }

    console.log();
  }

  console.log(pc.gray(`Total: ${manifest.profiles.length} profile(s)`));
  console.log(pc.gray(`Connected profile: ${config.profileName}`));
}
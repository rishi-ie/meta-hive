import pc from 'picocolors';
import { loadConfig, clearConfig } from '../hive/config.js';
import { removeProfileFromManifest } from '../hive/manifest.js';
import { getProfileDirectory } from '../profile/creator.js';
import { deleteDirectory } from '../utils/fileSystem.js';

export async function leaveHive(): Promise<void> {
  const config = await loadConfig();

  if (!config?.hivePath) {
    console.log(pc.red('❌ Not connected to any hive.'));
    return;
  }

  const { hivePath, profileName } = config;

  // Don't allow leader to leave (they should delete the hive instead)
  if (config.isLeader) {
    console.log(pc.red('❌ Leaders cannot leave the hive.'));
    console.log(pc.gray('  Delete the hive folder instead, or transfer leadership first.'));
    return;
  }

  console.log(pc.yellow(`⚠ Leaving hive: ${hivePath}`));
  console.log(pc.yellow(`   Profile: ${profileName}`));
  console.log();

  // Remove from manifest
  await removeProfileFromManifest(hivePath, profileName);

  // Delete profile directory
  const profileDir = await getProfileDirectory(hivePath, profileName, false);
  await deleteDirectory(profileDir);

  // Clear local config
  await clearConfig();

  console.log(pc.green('✅ Successfully left the hive.'));
  console.log();
  console.log(pc.cyan('Your profile has been removed from the hive.'));
  console.log(pc.gray('  The hive data remains intact.'));
  console.log(pc.gray('  To rejoin, run: meta-hive join <path> --profile <name>'));
}
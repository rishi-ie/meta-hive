import { readFile, writeFile, mkdir, readdir, stat, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export { mkdir };

export async function fileExists(filepath: string): Promise<boolean> {
  return existsSync(filepath);
}

export async function readJsonFile<T>(filepath: string): Promise<T | null> {
  try {
    const content = await readFile(filepath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function writeJsonFile(filepath: string, data: unknown): Promise<void> {
  const dir = path.dirname(filepath);
  await mkdir(dir, { recursive: true });
  await writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function readMarkdownFile(filepath: string): Promise<string | null> {
  try {
    return await readFile(filepath, 'utf-8');
  } catch {
    return null;
  }
}

export async function writeMarkdownFile(filepath: string, content: string): Promise<void> {
  const dir = path.dirname(filepath);
  await mkdir(dir, { recursive: true });
  await writeFile(filepath, content, 'utf-8');
}

export async function listDirectories(dirPath: string): Promise<string[]> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
  } catch {
    return [];
  }
}

export async function getFileModifiedTime(filepath: string): Promise<string | null> {
  try {
    const stats = await stat(filepath);
    return stats.mtime.toISOString();
  } catch {
    return null;
  }
}

export async function deleteDirectory(dirPath: string): Promise<void> {
  try {
    await rm(dirPath, { recursive: true, force: true });
  } catch {
    // Ignore errors
  }
}

export function joinPath(...parts: string[]): string {
  return path.join(...parts);
}
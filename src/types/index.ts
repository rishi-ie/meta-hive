export interface Profile {
  name: string;
  identity: ProfileIdentity;
  projects: string[];
  isLeader: boolean;
  createdAt: string;
  lastActive: string;
}

export interface ProfileIdentity {
  name: string;
  description: string;
  personality?: string;
  capabilities?: string[];
}

export interface HiveManifest {
  version: string;
  createdAt: string;
  leader: string;
  profiles: string[];
}

export interface HiveConfig {
  hivePath: string;
  profileName: string;
  isLeader: boolean;
  activeProject: string | null;
}

export interface ProjectContext {
  profileName: string;
  projectName: string;
  context: string;
  lastModified: string;
}

export interface HumanProfile {
  name: string;
  preferences: string[];
  feedbackPath: string;
}

export interface ScanResult {
  profiles: Profile[];
  projects: string[];
  lastScan: string;
  insights?: string[];
}
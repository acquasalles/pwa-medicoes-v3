export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  original: string;
}

export const parseVersion = (versionString: string): SemanticVersion | null => {
  const cleaned = versionString.trim().replace(/^v/, '');

  const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    console.warn('Invalid version format:', versionString);
    return null;
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    original: versionString,
  };
};

export const compareVersions = (version1: string, version2: string): number => {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);

  if (!v1 || !v2) {
    return 0;
  }

  if (v1.major !== v2.major) {
    return v1.major > v2.major ? 1 : -1;
  }

  if (v1.minor !== v2.minor) {
    return v1.minor > v2.minor ? 1 : -1;
  }

  if (v1.patch !== v2.patch) {
    return v1.patch > v2.patch ? 1 : -1;
  }

  return 0;
};

export const isNewerVersion = (currentVersion: string, latestVersion: string): boolean => {
  return compareVersions(latestVersion, currentVersion) > 0;
};

export const isValidVersion = (versionString: string): boolean => {
  return parseVersion(versionString) !== null;
};

export const formatVersion = (versionString: string): string => {
  const version = parseVersion(versionString);
  if (!version) return versionString;

  return `${version.major}.${version.minor}.${version.patch}`;
};

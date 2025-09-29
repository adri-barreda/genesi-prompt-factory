const profiles = new Map();
const promptPackages = new Map();

export function saveClientProfile(id, profile) {
  profiles.set(id, { ...profile, id });
  return profiles.get(id);
}

export function getClientProfile(id) {
  return profiles.get(id);
}

export function savePromptPackage(profileId, campaignId, packageData) {
  const key = `${profileId}:${campaignId}`;
  promptPackages.set(key, packageData);
  return packageData;
}

export function getPromptPackage(profileId, campaignId) {
  return promptPackages.get(`${profileId}:${campaignId}`);
}

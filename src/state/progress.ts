import type { ProgressRecord } from "../types";

const key = "space-coding-progress";

export const defaultProgress: ProgressRecord = {
  childName: "小小指挥官",
  robotName: "豆豆",
  completedMissionIds: [],
  attemptsByMissionId: {},
  unlockedRewards: [],
  lastMissionId: "direction-1"
};

export function loadProgress(): ProgressRecord {
  const stored = window.localStorage.getItem(key);
  return stored ? { ...defaultProgress, ...JSON.parse(stored) } : defaultProgress;
}

export function saveProgress(progress: ProgressRecord) {
  window.localStorage.setItem(key, JSON.stringify(progress));
}

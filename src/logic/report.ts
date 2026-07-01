import type { ProgressRecord } from "../types";

export function buildParentReport(progress: ProgressRecord) {
  const difficultMission = Object.entries(progress.attemptsByMissionId).sort((a, b) => b[1] - a[1])[0];
  const estimatedMinutes = progress.completedMissionIds.length * 3;
  const practicedAbilities = Array.from(
    new Set(
      progress.completedMissionIds.map((id) =>
        id.startsWith("loop") ? "重复和规律" : id.startsWith("debug") ? "发现和修改问题" : "方向和顺序"
      )
    )
  );

  return {
    childName: progress.childName,
    robotName: progress.robotName,
    completedCount: progress.completedMissionIds.length,
    rewardCount: progress.unlockedRewards.length,
    estimatedMinutes,
    practicedAbilities,
    stuckPoint: difficultMission ? `${difficultMission[0]} 重试了 ${difficultMission[1]} 次` : "目前没有明显卡点",
    suggestion: difficultMission
      ? "下次可以先从相近任务复习，让孩子自己说出机器人要先做什么。"
      : "可以继续完成下一关，保持每次 8-12 分钟的轻量体验。"
  };
}

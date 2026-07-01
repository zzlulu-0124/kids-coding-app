import { buildParentReport } from "../logic/report";
import type { ProgressRecord } from "../types";

const progress: ProgressRecord = {
  childName: "小宇",
  robotName: "豆豆",
  completedMissionIds: ["direction-1", "direction-2", "loop-1"],
  attemptsByMissionId: { "direction-1": 1, "direction-2": 3, "loop-1": 2 },
  unlockedRewards: ["飞船能源灯"],
  lastMissionId: "loop-1"
};

describe("buildParentReport", () => {
  it("summarizes progress in parent-friendly language", () => {
    const report = buildParentReport(progress);
    expect(report.completedCount).toBe(3);
    expect(report.childName).toBe("小宇");
    expect(report.estimatedMinutes).toBe(9);
    expect(report.practicedAbilities).toContain("方向和顺序");
    expect(report.practicedAbilities).toContain("重复和规律");
    expect(report.stuckPoint).toContain("direction-2");
    expect(report.suggestion.length).toBeGreaterThan(4);
  });
});

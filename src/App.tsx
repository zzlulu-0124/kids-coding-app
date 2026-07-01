import { useEffect, useMemo, useState } from "react";
import { findCard, findMission, planets } from "./data/course";
import { runMission, type MissionResult, type RuntimeCommand } from "./logic/robotEngine";
import { buildParentReport } from "./logic/report";
import { defaultProgress, loadProgress, saveProgress } from "./state/progress";
import type { CommandType, Mission, Planet, ProgressRecord } from "./types";
import { LessonAnimation } from "./components/LessonAnimation";
import { MissionIntro } from "./components/MissionIntro";
import { MissionPlay } from "./components/MissionPlay";
import { ParentGate } from "./components/ParentGate";
import { ParentReport } from "./components/ParentReport";
import { PlanetMap } from "./components/PlanetMap";
import { PracticeScreen } from "./components/PracticeScreen";
import { ResultScreen } from "./components/ResultScreen";
import { RewardBay } from "./components/RewardBay";
import { StartScreen } from "./components/StartScreen";

type Screen = "start" | "map" | "lesson" | "practice" | "intro" | "play" | "result" | "rewards" | "parentGate" | "parentReport";

export function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [progress, setProgress] = useState<ProgressRecord>(defaultProgress);
  const [activeMissionId, setActiveMissionId] = useState(defaultProgress.lastMissionId);
  const [commands, setCommands] = useState<RuntimeCommand[]>([]);
  const [result, setResult] = useState<MissionResult | null>(null);

  useEffect(() => {
    const stored = loadProgress();
    setProgress(stored);
    setActiveMissionId(stored.lastMissionId);
  }, []);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const mission = findMission(activeMissionId);
  const report = useMemo(() => buildParentReport(progress), [progress]);

  function openMission(nextMission: Mission) {
    setActiveMissionId(nextMission.id);
    setCommands([]);
    setResult(null);
    setProgress((current) => ({ ...current, lastMissionId: nextMission.id }));
    setScreen("lesson");
  }

  function addCommand(type: CommandType) {
    if (commands.length >= mission.maxCards) return;
    const card = findCard(type);
    setCommands((current) => [...current, { type, repeatCount: card.repeatCount }]);
  }

  function runActiveMission() {
    const missionResult = runMission(mission, commands);
    setResult(missionResult);
    setProgress((current) => {
      const attempts = (current.attemptsByMissionId[mission.id] ?? 0) + 1;
      const completed = missionResult.success
        ? Array.from(new Set([...current.completedMissionIds, mission.id]))
        : current.completedMissionIds;
      const rewards = missionResult.success
        ? Array.from(new Set([...current.unlockedRewards, mission.reward]))
        : current.unlockedRewards;

      return {
        ...current,
        completedMissionIds: completed,
        attemptsByMissionId: { ...current.attemptsByMissionId, [mission.id]: attempts },
        unlockedRewards: rewards,
        lastMissionId: mission.id
      };
    });
    setScreen("result");
  }

  function resetCommands() {
    setCommands([]);
    setResult(null);
  }

  return (
    <main className="app-shell">
      {screen === "start" && (
        <StartScreen
          progress={progress}
          onStart={() => setScreen("map")}
          onParent={() => setScreen("parentGate")}
        />
      )}

      {screen === "map" && (
        <PlanetMap
          planets={planets}
          progress={progress}
          onMissionSelect={openMission}
          onRewards={() => setScreen("rewards")}
          onParent={() => setScreen("parentGate")}
        />
      )}

      {screen === "lesson" && (
        <LessonAnimation mission={mission} onBack={() => setScreen("map")} onDone={() => setScreen("practice")} />
      )}

      {screen === "practice" && (
        <PracticeScreen mission={mission} onBack={() => setScreen("lesson")} onDone={() => setScreen("intro")} />
      )}

      {screen === "intro" && (
        <MissionIntro mission={mission} onBack={() => setScreen("practice")} onEnter={() => setScreen("play")} />
      )}

      {screen === "play" && (
        <MissionPlay
          mission={mission}
          commands={commands}
          result={result}
          onAddCommand={addCommand}
          onRemoveLast={() => setCommands((current) => current.slice(0, -1))}
          onReset={resetCommands}
          onRun={runActiveMission}
          onBack={() => setScreen("intro")}
        />
      )}

      {screen === "result" && result && (
        <ResultScreen
          mission={mission}
          result={result}
          onRetry={() => {
            resetCommands();
            setScreen("play");
          }}
          onMap={() => setScreen("map")}
          onRewards={() => setScreen("rewards")}
        />
      )}

      {screen === "rewards" && (
        <RewardBay
          progress={progress}
          planets={planets as Planet[]}
          onBack={() => setScreen("map")}
        />
      )}

      {screen === "parentGate" && <ParentGate onBack={() => setScreen("start")} onPassed={() => setScreen("parentReport")} />}

      {screen === "parentReport" && (
        <ParentReport
          report={report}
          progress={progress}
          planets={planets}
          onBack={() => setScreen("map")}
        />
      )}
    </main>
  );
}

export type Ability = "direction" | "sequence" | "loop" | "debug";

export type CommandType = "forward" | "backward" | "left" | "right" | "jump" | "repeat";

export type Cell = {
  x: number;
  y: number;
};

export type Direction = "north" | "east" | "south" | "west";

export type CommandCard = {
  type: CommandType;
  label: string;
  icon: string;
  repeatCount?: number;
};

export type CommandStep = {
  type: CommandType;
  repeatCount?: number;
};

export type Mission = {
  id: string;
  planetId: string;
  title: string;
  goal: string;
  ability: Ability;
  introKind: "video" | "voice";
  gridSize: number;
  start: Cell;
  startDirection: Direction;
  target: Cell;
  obstacles: Cell[];
  availableCards: CommandType[];
  solution: CommandStep[];
  maxCards: number;
  reward: string;
};

export type Planet = {
  id: string;
  title: string;
  abilityLabel: string;
  story: string;
  missions: Mission[];
  badge: string;
};

export type ProgressRecord = {
  childName: string;
  robotName: string;
  completedMissionIds: string[];
  attemptsByMissionId: Record<string, number>;
  unlockedRewards: string[];
  lastMissionId: string;
};

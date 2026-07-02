import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App";
import { commandCards, planets } from "../data/course";

describe("App flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("lets a child move from start screen to planet map", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "开始太空任务" }));
    expect(screen.getByText("方向星球")).toBeInTheDocument();
  });

  it("marks the start hero image for mobile-safe layout", () => {
    render(<App />);
    expect(screen.getByAltText("机器人在太空星球上准备冒险")).toHaveClass("space-scene-image");
  });

  it("lets a child run a simple mission and see a reward", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "开始太空任务" }));
    await userEvent.click(screen.getByRole("button", { name: /机器人醒来/ }));
    await userEvent.click(screen.getByRole("button", { name: "我看懂了" }));
    await userEvent.click(screen.getByRole("button", { name: "3 张前进卡" }));
    await userEvent.click(screen.getByRole("button", { name: /进入任务/ }));
    expect(screen.getByText("任务说明")).toBeInTheDocument();
    expect(screen.getByText("这一关要放 3 张前进卡。")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /进入任务/ }));
    expect(screen.getByText("目标距离：3 步")).toBeInTheDocument();
    expect(document.querySelectorAll(".play-robot")).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "前进" }));
    await userEvent.click(screen.getByRole("button", { name: "前进" }));
    await userEvent.click(screen.getByRole("button", { name: "前进" }));
    await userEvent.click(screen.getByRole("button", { name: "开始执行" }));
    expect(screen.getAllByText("执行中").length).toBeGreaterThan(0);
    expect(document.querySelectorAll(".play-robot")).toHaveLength(1);
    expect(screen.queryByText(/完成任务/)).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/完成任务/)).toBeInTheDocument(), { timeout: 4000 });
    expect(screen.getByText(/获得奖励/)).toBeInTheDocument();
  });

  it("shows a visible short animation before a video-style mission", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "开始太空任务" }));
    await userEvent.click(screen.getByRole("button", { name: /机器人醒来/ }));
    expect(screen.getByText("短动画正在播放")).toBeInTheDocument();
    expect(screen.getByText("2-4 分钟短动画")).toBeInTheDocument();
    expect(screen.getByText("1. 看目标")).toBeInTheDocument();
    expect(screen.getByText("2. 选卡片")).toBeInTheDocument();
    expect(screen.getByText("3. 让机器人出发")).toBeInTheDocument();
    expect(screen.getByText("先看目标和机器人箭头。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "▶ 重新播放" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "听老师讲解" })).toBeInTheDocument();
  });

  it("shows voice guidance for ordinary missions", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "开始太空任务" }));
    await userEvent.click(screen.getByRole("button", { name: /找到基地/ }));
    expect(screen.getByText("老师提示和动画演示")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "听老师提示" })).toBeInTheDocument();
    expect(screen.getByText(/准备好了吗/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "听老师提示" }));
    expect(screen.getByText("老师正在带你读这段任务提示。")).toBeInTheDocument();
  });

  it("explains turn missions with direction rules before running", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "开始太空任务" }));
    await userEvent.click(screen.getByRole("button", { name: "03第一次转弯" }));
    await userEvent.click(screen.getByRole("button", { name: "我看懂了" }));
    expect(screen.getByText("机器人箭头朝上，基地在右边。第一步要先转身还是前进？")).toBeInTheDocument();
    expect(screen.getByText("第一步：原地向右转身")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "右转身卡" }));
    await userEvent.click(screen.getByRole("button", { name: "进入任务" }));
    await userEvent.click(screen.getByRole("button", { name: "进入任务" }));
    expect(screen.getByText("前进不是固定向上走，而是沿着箭头方向走一格。左转身和右转身只会原地改变箭头方向。")).toBeInTheDocument();
    expect(screen.getByText("这关要做的动作")).toBeInTheDocument();
    expect(screen.getByText("原地转身：从上变成右")).toBeInTheDocument();
    expect(screen.getByText("沿右方向走 1 格")).toBeInTheDocument();
  });

  it("asks a small practice question before the hands-on task", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "开始太空任务" }));
    await userEvent.click(screen.getByRole("button", { name: /机器人醒来/ }));
    await userEvent.click(screen.getByRole("button", { name: "我看懂了" }));
    expect(screen.getByText("小练习")).toBeInTheDocument();
    expect(screen.getByText("机器人和能量站中间空了两格，要放几张前进卡？")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "进入任务" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "3 张前进卡" }));
    expect(screen.getByText("答对了，可以进入实操任务。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "进入任务" })).toBeEnabled();
  });

  it("protects parent report behind a simple gate", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "家长查看" }));
    expect(screen.getByText("请输入 3 + 2 的答案")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("答案"), "5");
    await userEvent.click(screen.getByRole("button", { name: "查看报告" }));
    expect(screen.getByText(/学习报告/)).toBeInTheDocument();
  });

  it("renders every mission through lesson, practice, intro and play screens", async () => {
    const missions = planets.flatMap((planet) => planet.missions);

    for (const mission of missions) {
      window.localStorage.clear();
      const { unmount } = render(<App />);
      await userEvent.click(screen.getByRole("button", { name: "开始太空任务" }));
      const missionNumber = planets.find((planet) => planet.id === mission.planetId)?.missions.findIndex((item) => item.id === mission.id) ?? 0;
      const buttonName = `${String(missionNumber + 1).padStart(2, "0")}${mission.title}`;
      await userEvent.click(screen.getByRole("button", { name: buttonName }));

      expect(screen.getAllByText(mission.title).length, `${mission.id} title missing`).toBeGreaterThan(0);
      expect(screen.getByText(mission.goal)).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: mission.introKind === "video" ? "我看懂了" : "我看懂了" }));

      expect(screen.getByText("小练习")).toBeInTheDocument();
      const firstCard = commandCards.find((card) => card.type === mission.solution[0]?.type);
      expect(firstCard, `${mission.id} first card missing`).toBeTruthy();
      const practiceAnswer = mission.id === "direction-1" ? "3 张前进卡" : `${firstCard?.label}卡`;
      await userEvent.click(screen.getByRole("button", { name: practiceAnswer }));
      expect(screen.getByRole("button", { name: "进入任务" })).toBeEnabled();
      await userEvent.click(screen.getByRole("button", { name: "进入任务" }));

      expect(screen.getByText("任务说明")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "进入任务" }));

      expect(screen.getByText("指令卡片")).toBeInTheDocument();
      expect(screen.getByText("这关要做的动作")).toBeInTheDocument();
      expect(screen.getByText(/前进不是固定向上走/)).toBeInTheDocument();
      expect(document.querySelectorAll(".play-robot").length, `${mission.id} should show one robot`).toBe(1);
      expect(document.querySelectorAll(".target-token").length, `${mission.id} should show one target`).toBe(1);
      expect(document.querySelectorAll(".rock-token").length, `${mission.id} obstacle count mismatch`).toBe(mission.obstacles.length);
      for (const step of mission.solution) {
        const card = commandCards.find((item) => item.type === step.type);
        expect(card, `${mission.id} solution card not found`).toBeTruthy();
        expect(screen.getAllByText(card?.label ?? "").length, `${mission.id} missing solution label ${step.type}`).toBeGreaterThan(0);
      }

      unmount();
    }
  });
});

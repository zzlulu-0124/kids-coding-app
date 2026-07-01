import { Rocket, ShieldCheck } from "lucide-react";
import type { ProgressRecord } from "../types";
import heroImage from "../assets/space-robot-hero.png";

type Props = {
  progress: ProgressRecord;
  onStart: () => void;
  onParent: () => void;
};

export function StartScreen({ progress, onStart, onParent }: Props) {
  return (
    <section className="start-screen">
      <div className="top-bar">
        <div className="brand-mark">
          <Rocket size={24} />
          <span>小小太空指挥官</span>
        </div>
        <button className="ghost-button" type="button" onClick={onParent}>
          <ShieldCheck size={18} />
          家长查看
        </button>
      </div>

      <div className="hero-layout">
        <div className="hero-copy">
          <p className="eyebrow">5-7 岁家庭体验版</p>
          <h1>指挥机器人探索星球</h1>
          <p className="hero-text">
            用简单的方向卡片完成任务，帮 {progress.robotName} 收集能量、修复飞船，慢慢理解顺序、重复和发现问题。
          </p>
          <button className="primary-button large" type="button" onClick={onStart}>
            开始太空任务
          </button>
        </div>

        <div className="space-scene" aria-label="太空机器人场景">
          <img className="space-scene-image" src={heroImage} alt="机器人在太空星球上准备冒险" />
          <div className="mission-bubble bubble-one">前进</div>
          <div className="mission-bubble bubble-two">收集能量</div>
        </div>
      </div>
    </section>
  );
}

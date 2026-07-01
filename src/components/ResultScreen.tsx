import { Gift, Map, RotateCcw } from "lucide-react";
import type { Mission } from "../types";
import type { MissionResult } from "../logic/robotEngine";

type Props = {
  mission: Mission;
  result: MissionResult;
  onRetry: () => void;
  onMap: () => void;
  onRewards: () => void;
};

export function ResultScreen({ mission, result, onRetry, onMap, onRewards }: Props) {
  if (!result.success) {
    return (
      <section className="result-screen">
        <article className="result-panel">
          <p className="result-mark">再试一次</p>
          <h1>机器人还没找到路</h1>
          <p>我们换一步试试。可以撤掉最后一张卡，也可以重新排一条路线。</p>
          <div className="tool-row center">
            <button className="primary-button" type="button" onClick={onRetry}>
              <RotateCcw size={18} />
              调整路线
            </button>
            <button className="ghost-button" type="button" onClick={onMap}>
              <Map size={18} />
              返回地图
            </button>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="result-screen">
      <article className="result-panel success">
        <div className="celebration-burst">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <p className="result-mark">完成任务</p>
        <h1>机器人到达能量站</h1>
        <p>获得奖励：{mission.reward}</p>
        <div className="reward-spark">
          <span>⚡</span>
          飞船点亮
        </div>
        <div className="tool-row center">
          <button className="primary-button" type="button" onClick={onRewards}>
            <Gift size={18} />
            打开奖励舱
          </button>
          <button className="ghost-button" type="button" onClick={onMap}>
            <Map size={18} />
            继续探索
          </button>
        </div>
      </article>
    </section>
  );
}

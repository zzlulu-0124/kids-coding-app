import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useState } from "react";

type Props = {
  onBack: () => void;
  onPassed: () => void;
};

export function ParentGate({ onBack, onPassed }: Props) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (answer.trim() === "5") {
      setError("");
      onPassed();
      return;
    }
    setError("答案不对，家长可以再试一次。");
  }

  return (
    <section className="page-stack narrow">
      <button className="ghost-button self-start" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        返回
      </button>
      <article className="parent-gate">
        <LockKeyhole size={36} />
        <h1>家长入口</h1>
        <p>请输入 3 + 2 的答案</p>
        <label className="answer-field">
          答案
          <input value={answer} onChange={(event) => setAnswer(event.target.value)} inputMode="numeric" />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button large" type="button" onClick={submit}>
          查看报告
        </button>
      </article>
    </section>
  );
}

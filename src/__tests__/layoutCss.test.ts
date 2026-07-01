import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("mission board layout css", () => {
  const css = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");

  it("keeps mission boards as equal square grids", () => {
    const boardBlock = css.match(/\.grid-board\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";

    expect(boardBlock).toContain("grid-template-columns: repeat(var(--grid-size), 1fr)");
    expect(boardBlock).toContain("grid-template-rows: repeat(var(--grid-size), 1fr)");
    expect(boardBlock).toContain("aspect-ratio: 1");
  });

  it("keeps robot direction badges inside the robot token", () => {
    const badgeBlocks = [...css.matchAll(/\.robot-token strong\s*\{([\s\S]*?)\n\}/g)].map((match) => match[1]);

    expect(badgeBlocks.length).toBeGreaterThan(0);
    for (const block of badgeBlocks) {
      expect(block).not.toMatch(/right:\s*-/);
      expect(block).not.toMatch(/top:\s*-/);
    }
  });
});

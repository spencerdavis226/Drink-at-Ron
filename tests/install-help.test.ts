import { describe, expect, it } from "vitest";
import { isIOSSafari } from "../src/app/install-help";

const safari = "AppleWebKit/605.1.15 Version/26.0 Mobile/15E148 Safari/604.1";
describe("Safari-only installation help", () => {
  it.each([
    ["iPhone", `Mozilla/5.0 (iPhone; CPU iPhone OS 26_0) ${safari}`, 5, true],
    ["iPad", `Mozilla/5.0 (iPad; CPU OS 26_0) ${safari}`, 5, true],
    [
      "desktop iPad",
      `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) ${safari}`,
      5,
      true,
    ],
    [
      "Mac",
      `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) ${safari}`,
      0,
      false,
    ],
    [
      "Android",
      `Mozilla/5.0 (Linux; Android 15) Chrome/140.0 Safari/537.36`,
      5,
      false,
    ],
    [
      "embedded web view",
      "Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Mobile/15E148",
      5,
      false,
    ],
    ["unknown browser", "", 0, false],
  ])("%s", (_name, userAgent, maxTouchPoints, eligible) => {
    expect(isIOSSafari({ userAgent, maxTouchPoints })).toBe(eligible);
  });
  it.each([
    "CriOS/140",
    "FxiOS/140",
    "EdgiOS/140",
    "OPiOS/100",
    "DuckDuckGo/1",
    "GSA/400",
    "FBAN/FBIOS",
    "Instagram/300",
  ])("does not offer Safari instructions in %s", (token) => {
    expect(
      isIOSSafari({
        userAgent: `Mozilla/5.0 (iPhone) ${safari} ${token}`,
        maxTouchPoints: 5,
      }),
    ).toBe(false);
  });
});

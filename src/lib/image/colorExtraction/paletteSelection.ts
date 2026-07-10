import { colorDistance } from "../../color/colorUtils";
import type { PaletteColor } from "../../../types/color";

export function choosePaletteColors(candidates: PaletteColor[], colorCount: number) {
  const chosen: PaletteColor[] = [];
  const addDistinctColor = (color: PaletteColor | undefined) => {
    if (!color || chosen.length >= colorCount) {
      return;
    }

    const isDuplicate = chosen.some(
      (chosenColor) => colorDistance(chosenColor.rgb, color.rgb) < 30,
    );

    if (!isDuplicate) {
      chosen.push(color);
    }
  };

  addDistinctColor(candidates[0]);

  candidates
    .filter((color) => color.hsl.s >= 0.2 && color.population >= 0.001)
    .sort((first, second) => colorfulnessScore(second) - colorfulnessScore(first))
    .slice(0, 4)
    .forEach(addDistinctColor);

  addDistinctColor(
    candidates
      .filter((color) => color.luminance >= 0.78)
      .sort((first, second) => second.population - first.population)[0],
  );
  addDistinctColor(
    candidates
      .filter((color) => color.luminance <= 0.28)
      .sort((first, second) => second.population - first.population)[0],
  );

  candidates.forEach(addDistinctColor);

  return chosen
    .slice(0, colorCount)
    .sort((first, second) => second.population - first.population);
}

export function colorfulnessScore(color: PaletteColor) {
  return color.hsl.s * 2 + color.population * 3 + middleLightnessScore(color);
}

export function middleLightnessScore(color: PaletteColor) {
  return 1 - Math.abs(color.hsl.l - 0.52);
}

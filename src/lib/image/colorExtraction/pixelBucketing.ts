import { createPaletteColor } from "../../color/colorUtils";

export type ColorBucket = {
  rTotal: number;
  gTotal: number;
  bTotal: number;
  count: number;
};

export function bucketImageColors(
  pixelData: Uint8ClampedArray,
  bucketSize: number,
  minAlpha: number,
) {
  const buckets = new Map<string, ColorBucket>();
  let sampledPixelCount = 0;

  for (let index = 0; index < pixelData.length; index += 4) {
    const alpha = pixelData[index + 3];

    if (alpha < minAlpha) {
      continue;
    }

    const alphaRatio = alpha / 255;
    const red = compositeChannel(pixelData[index], alphaRatio);
    const green = compositeChannel(pixelData[index + 1], alphaRatio);
    const blue = compositeChannel(pixelData[index + 2], alphaRatio);
    const bucketKey = [
      Math.floor(red / bucketSize),
      Math.floor(green / bucketSize),
      Math.floor(blue / bucketSize),
    ].join("-");
    const bucket = buckets.get(bucketKey) ?? {
      rTotal: 0,
      gTotal: 0,
      bTotal: 0,
      count: 0,
    };

    bucket.rTotal += red;
    bucket.gTotal += green;
    bucket.bTotal += blue;
    bucket.count += 1;
    sampledPixelCount += 1;
    buckets.set(bucketKey, bucket);
  }

  const candidates = Array.from(buckets.values())
    .map((bucket) =>
      createPaletteColor(
        {
          r: bucket.rTotal / bucket.count,
          g: bucket.gTotal / bucket.count,
          b: bucket.bTotal / bucket.count,
        },
        sampledPixelCount === 0 ? 0 : bucket.count / sampledPixelCount,
      ),
    )
    .sort((first, second) => second.population - first.population);

  return {
    candidates,
    sampledPixelCount,
  };
}

export function compositeChannel(channel: number, alphaRatio: number) {
  return Math.round(channel * alphaRatio + 255 * (1 - alphaRatio));
}

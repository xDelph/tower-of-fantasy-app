// credit for these functions: https://github.com/mapbox/pixelmatch
export function pixelMatches(
  img1: Buffer,
  img2: Buffer,
  k: number,
  m: number,
  maxDelta: number,
  yOnly: boolean = false,
): boolean {
  if ((k + 3) >= img1.length) {
    throw new Error(
      `Cannot get positions ${k} through ${k + 3} from img array of length ${img1.length} (in target img)`,
    );
  }
  if ((m + 3) >= img2.length) {
    throw new Error(`Cannot get positions ${m} through ${m + 3} from img array of length ${img2.length} (in sub img)`);
  }

  let r1: number = img1[k + 0];
  let g1: number = img1[k + 1];
  let b1: number = img1[k + 2];
  let a1: number = img1[k + 3];

  let r2: number = img2[m + 0];
  let g2: number = img2[m + 1];
  let b2: number = img2[m + 2];
  let a2: number = img2[m + 3];

  if (a1 === a2 && r1 === r2 && g1 === g2 && b1 === b2) return true;

  if (a1 < 255) {
    a1 /= 255;
    r1 = blend(r1, a1);
    g1 = blend(g1, a1);
    b1 = blend(b1, a1);
  }

  if (a2 < 255) {
    a2 /= 255;
    r2 = blend(r2, a2);
    g2 = blend(g2, a2);
    b2 = blend(b2, a2);
  }

  const y: number = rgb2y(r1, g1, b1) - rgb2y(r2, g2, b2);

  let delta: number;

  if (yOnly) { // brightness difference only
    delta = y;
  } else {
    const i: number = rgb2i(r1, g1, b1) - rgb2i(r2, g2, b2);
    const q: number = rgb2q(r1, g1, b1) - rgb2q(r2, g2, b2);
    delta = 0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q;
  }

  return delta <= maxDelta;
}

function rgb2y(r: number, g: number, b: number): number { return r * 0.29889531 + g * 0.58662247 + b * 0.11448223; }
function rgb2i(r: number, g: number, b: number): number { return r * 0.59597799 - g * 0.27417610 - b * 0.32180189; }
function rgb2q(r: number, g: number, b: number): number { return r * 0.21147017 - g * 0.52261711 + b * 0.31114694; }

// blend semi-transparent color with white
function blend(c: number, a: number): number {
  return 255 + (c - 255) * a;
}

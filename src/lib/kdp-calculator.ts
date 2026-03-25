export type PaperType = "white" | "cream" | "color";

export type TrimSize = {
  name: string;
  width: number;
  height: number;
};

export const ALL_TRIM_SIZES: TrimSize[] = [
  { name: "8.5 x 11", width: 8.5, height: 11 },
  { name: "6 x 9", width: 6, height: 9 },
  { name: "5.5 x 8.5", width: 5.5, height: 8.5 },
  { name: "8 x 10", width: 8, height: 10 },
  { name: "8.5 x 8.5", width: 8.5, height: 8.5 },
];

const PAPER_MULTIPLIERS: Record<PaperType, number> = {
  white: 0.002252,
  cream: 0.0025,
  color: 0.002347,
};

export function calculateSpineWidth(pages: number, paperType: PaperType): number {
  return pages * PAPER_MULTIPLIERS[paperType];
}

export function calculateFullCoverWidth(
  trimWidth: number,
  pages: number,
  paperType: PaperType
): number {
  const spineWidth = calculateSpineWidth(pages, paperType);
  return trimWidth * 2 + spineWidth + 0.25;
}

export function calculateFullCoverHeight(trimHeight: number): number {
  return trimHeight + 0.25;
}

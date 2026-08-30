import htmlFundamentals from "@/assets/html-fundamentals.mp4.asset.json";

/** key: `${domainId}:${levelIndex}` */
const LESSON_VIDEOS: Record<string, string> = {
  "web-development:1": htmlFundamentals.url,
};

export const lessonVideoFor = (domainId: string, levelIndex: number): string | undefined =>
  LESSON_VIDEOS[`${domainId}:${levelIndex}`];

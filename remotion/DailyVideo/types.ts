export interface DailySlide {
  from: number;
  durationInFrames: number;
  bg: string;
  eyebrow?: string;
  headline: string;
  sub?: string;
  accentColor: string;
  align?: 'left' | 'center';
}

export interface DailyVideoProps {
  slides?: DailySlide[];
  brandName?: string;
  totalFrames?: number;
}

export interface DailyVideoContent {
  topic: string;
  angle: string;
  slides: Array<{
    eyebrow?: string;
    headline: string;
    sub?: string;
    bg?: string;
    accentColor?: string;
    align?: 'left' | 'center';
    durationSeconds: number;
  }>;
  caption: string;
  hashtags: string[];
  tiktokSound: string;
}

// Remotion compositions entry point — must call registerRoot()
// Studio:  npx remotion studio remotion/index.ts
// Render:  npx remotion render remotion/index.ts FirstKeysIndy-Vertical out/FirstKeysIndy-vertical.mp4
//          npx remotion render remotion/index.ts DailyVideo-Vertical out/daily-vertical.mp4

import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);

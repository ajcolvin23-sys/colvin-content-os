# Remotion Component Spec — Colvin Content OS

Specifications for every reusable Remotion React component in the Gabriel Remotion Studio library.

---

## HeroHookScene

**Use case:** Opening hook scene for any video. Full-screen impact.
**Duration range:** 2-5 seconds

**Props:**
```typescript
interface HeroHookSceneProps {
  hookText: string;        // Max 15 words
  backgroundType: 'color' | 'image' | 'gradient';
  backgroundColor?: string;
  backgroundImage?: string;
  textColor: string;
  fontSize: 'xl' | '2xl' | '3xl';  // Responsive to text length
  motionPreset: 'zoom_in' | 'slide_up' | 'fade_in';
  brandAccentColor: string;
}
```

**Visual output:** Full-screen with large bold hook text. Can animate in from direction specified.

---

## ProblemAgitationScene

**Use case:** Name the pain point. Create tension before the solution.
**Duration range:** 3-8 seconds

**Props:**
```typescript
interface ProblemAgitationSceneProps {
  problemText: string;       // The pain point statement
  subtext?: string;          // Optional elaboration
  visualStyle: 'dark' | 'contrast' | 'minimal';
  textAnimation: 'word_by_word' | 'line_by_line' | 'fade_in';
  brandColor: string;
}
```

---

## ProofPointScene

**Use case:** Social proof, statistics, results, credibility signals.
**Duration range:** 5-10 seconds

**Props:**
```typescript
interface ProofPointSceneProps {
  proofType: 'statistic' | 'testimonial' | 'result' | 'credential';
  primaryText: string;       // The proof claim
  sourceText?: string;       // Source attribution (required for statistics)
  visualStyle: 'card' | 'overlay' | 'split';
  brandColors: { primary: string; secondary: string };
  animationPreset: 'count_up' | 'slide_in' | 'fade_in';
}
```

**Note:** All statistics displayed must have `sourceText` populated. Never display a statistic without attribution.

---

## OfferRevealScene

**Use case:** Reveal the solution, product, or offer.
**Duration range:** 5-12 seconds

**Props:**
```typescript
interface OfferRevealSceneProps {
  offerTitle: string;
  offerDescription: string;  // Max 30 words
  productImage?: string;
  price?: string;            // Only if approved by Alfred
  ctaText: string;
  ctaUrl?: string;
  revealAnimation: 'slide_up' | 'zoom_in' | 'fade_reveal';
  brandColors: { primary: string; secondary: string };
}
```

---

## StepByStepScene

**Use case:** Tutorial, how-to, numbered steps.
**Duration range:** 4-8 seconds per step

**Props:**
```typescript
interface StepByStepSceneProps {
  stepNumber: number;
  totalSteps: number;
  stepTitle: string;
  stepDescription: string;   // Max 20 words
  visualElement?: string;    // Image URL or icon
  progressBarVisible: boolean;
  brandColor: string;
}
```

---

## TestimonialStyleScene

**Use case:** Quote, story, transformation narrative.
**Duration range:** 5-10 seconds

**Props:**
```typescript
interface TestimonialStyleSceneProps {
  quoteText: string;         // Max 40 words
  attributionName?: string;  // "First-time homebuyer, Marion County" (no last names)
  visualStyle: 'quote_card' | 'text_overlay' | 'split_screen';
  brandColors: { primary: string; secondary: string };
  animationStyle: 'typewriter' | 'fade_in' | 'slide_in';
}
```

**Privacy note:** Never use real full names of clients or customers in testimonials without explicit written permission.

---

## CTAEndCard

**Use case:** Final call to action. Every video ends with this.
**Duration range:** 5-10 seconds

**Props:**
```typescript
interface CTAEndCardProps {
  ctaText: string;           // Max 8 words
  ctaSubtext?: string;       // Optional secondary message
  ctaUrl?: string;
  logoUrl: string;           // Lane logo (always present)
  brandColors: { primary: string; secondary: string; background: string };
  animationPreset: 'slide_up_all' | 'sequential_reveal' | 'fade_in';
  socialHandles?: { platform: string; handle: string }[];
}
```

---

## CaptionLayer

**Use case:** Always-on caption overlay. Applied to every scene.
**Duration range:** Continuous (spans entire video)

**Props:**
```typescript
interface CaptionLayerProps {
  captions: Array<{
    text: string;
    startSeconds: number;
    endSeconds: number;
  }>;
  style: 'default' | 'tiktok' | 'youtube' | 'minimal';
  fontSize: number;          // px
  textCase: 'uppercase' | 'titlecase' | 'lowercase';
  backgroundColor: string;   // Semi-transparent recommended
  textColor: string;
  position: 'bottom' | 'middle' | 'top';
}
```

---

## AnimatedText

**Use case:** Text animations for emphasis within a scene.
**Duration range:** Varies

**Props:**
```typescript
interface AnimatedTextProps {
  text: string;
  animationType: 'word_by_word' | 'char_by_char' | 'slide_in' | 'fade_in' | 'bounce';
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'black';
  textColor: string;
  delay?: number;            // seconds before animation starts
}
```

---

## LogoIntro

**Use case:** Brand logo intro for longer videos. Optional for short-form.
**Duration range:** 3-5 seconds

**Props:**
```typescript
interface LogoIntroProps {
  logoUrl: string;
  tagline?: string;
  backgroundColor: string;
  animationStyle: 'zoom_in' | 'fade_in' | 'slide_up';
  duration: number;
}
```

---

## LowerThird

**Use case:** Name, title, or fact overlay at bottom of screen.
**Duration range:** 3-6 seconds

**Props:**
```typescript
interface LowerThirdProps {
  primaryText: string;       // Name or main fact
  secondaryText?: string;    // Title or secondary info
  position: 'bottom_left' | 'bottom_right' | 'bottom_center';
  style: 'bar' | 'pill' | 'minimal';
  brandColor: string;
  animateIn: boolean;
}
```

---

## ImageSlideshowScene

**Use case:** Multiple images in sequence. For slideshow videos.
**Duration range:** 4-8 seconds per slide

**Props:**
```typescript
interface ImageSlideshowSceneProps {
  images: Array<{
    url: string;
    duration: number;
    caption?: string;
    overlayText?: string;
  }>;
  transitionStyle: 'fade' | 'slide' | 'cut';
  overlayColor?: string;     // For text contrast
  overallDuration: number;
}
```

---

## DataCardScene

**Use case:** Statistics, key numbers, data points.
**Duration range:** 4-8 seconds

**Props:**
```typescript
interface DataCardSceneProps {
  metric: string;            // The number or stat
  metricLabel: string;       // What the number means
  sourceText?: string;       // Required for statistics
  backgroundColor: string;
  textColor: string;
  animateMetric: boolean;    // Count-up animation for numbers
  brandAccent: string;
}
```

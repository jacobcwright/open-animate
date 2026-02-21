// Animation presets
export { springs, type SpringPreset } from './animations/springs';
export { easings, type EasingPreset } from './animations/easings';
export {
  fadeUp,
  fadeDown,
  slideInLeft,
  slideInRight,
  popIn,
  blurIn,
  elasticScale,
  perspectiveRotateIn,
} from './animations/elements';
export {
  springValue,
  springInterpolate,
  type AnimationContext,
} from './animations/helpers';

// Transitions
export {
  fadeBlur,
  scaleFade,
  clipCircle,
  clipPolygon,
  wipe,
  splitHorizontal,
  splitVertical,
  perspectiveFlip,
  morphExpand,
  zoomThrough,
  pushLeft,
  pushRight,
  slideLeft,
  slideRight,
} from './animations/transitions';

// Typography
export {
  AnimatedCharacters,
  TypewriterText,
  CountUp,
} from './animations/typography';

// Components
export { SafeArea } from './components/SafeArea';
export { Background } from './components/Background';
export { GlowOrb } from './components/GlowOrb';
export { Terminal } from './components/Terminal';
export { Card } from './components/Card';
export { Badge } from './components/Badge';
export { Grid } from './components/Grid';
export { Vignette } from './components/Vignette';

// Design tokens
export { palettes, type ColorPalette, type PaletteName } from './tokens/colors';
export { fonts } from './tokens/fonts';
export { spacing, type SpacingKey } from './tokens/spacing';

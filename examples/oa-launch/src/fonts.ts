import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';

export const { fontFamily: inter } = loadInter('normal', {
  weights: ['400', '500', '600'],
  subsets: ['latin'],
});

export const { fontFamily: spaceGrotesk } = loadSpaceGrotesk('normal', {
  weights: ['500', '600', '700'],
  subsets: ['latin'],
});

export const { fontFamily: jetBrainsMono } = loadJetBrainsMono('normal', {
  weights: ['400', '500', '700'],
  subsets: ['latin'],
});

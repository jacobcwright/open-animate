/**
 * Font family constants for common video typography pairings.
 * Use with Remotion's @remotion/google-fonts or staticFile() for local fonts.
 */

export const fonts = {
  heading: {
    inter: 'Inter, sans-serif',
    instrumentSerif: '"Instrument Serif", serif',
    spaceGrotesk: '"Space Grotesk", sans-serif',
    dmSans: '"DM Sans", sans-serif',
  },
  body: {
    inter: 'Inter, sans-serif',
    dmSans: '"DM Sans", sans-serif',
    sourceCodePro: '"Source Code Pro", monospace',
  },
  mono: {
    jetbrainsMono: '"JetBrains Mono", monospace',
    firaCode: '"Fira Code", monospace',
    geistMono: '"Geist Mono", monospace',
  },
} as const;

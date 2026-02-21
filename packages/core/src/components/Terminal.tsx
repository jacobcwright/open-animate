import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface TerminalProps {
  /** Lines of code/text to display */
  lines: string[];
  /** Delay before typing starts (seconds) */
  delay?: number;
  /** Characters per second */
  charsPerSecond?: number;
  /** Terminal title bar text */
  title?: string;
  /** Background color */
  bg?: string;
  /** Text color */
  textColor?: string;
  /** Font size */
  fontSize?: number;
  style?: React.CSSProperties;
}

/**
 * Code/terminal mockup with animated typing and window chrome.
 */
export const Terminal: React.FC<TerminalProps> = ({
  lines,
  delay = 0,
  charsPerSecond = 30,
  title = 'Terminal',
  bg = 'rgba(0, 0, 0, 0.8)',
  textColor = '#e2e8f0',
  fontSize = 18,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayFrames = Math.round(delay * fps);
  const adjustedFrame = Math.max(0, frame - delayFrames);
  const framesPerChar = fps / charsPerSecond;
  const totalCharsVisible = Math.floor(adjustedFrame / framesPerChar);

  // Calculate visible content
  let charsRemaining = totalCharsVisible;
  const visibleLines: string[] = [];

  for (const line of lines) {
    if (charsRemaining <= 0) break;
    const visible = line.slice(0, charsRemaining);
    visibleLines.push(visible);
    charsRemaining -= line.length + 1; // +1 for newline
  }

  const cursorBlink = Math.floor(frame / (fps * 0.5)) % 2 === 0;
  const allDone = totalCharsVisible >= lines.join('\n').length;

  return React.createElement(
    'div',
    {
      style: {
        background: bg,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        ...style,
      },
    },
    // Title bar
    React.createElement(
      'div',
      {
        style: {
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        },
      },
      // Traffic lights
      React.createElement('div', {
        style: {
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#ff5f57',
        },
      }),
      React.createElement('div', {
        style: {
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#febc2e',
        },
      }),
      React.createElement('div', {
        style: {
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#28c840',
        },
      }),
      React.createElement(
        'span',
        {
          style: {
            flex: 1,
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: 13,
            fontFamily: 'monospace',
          },
        },
        title,
      ),
    ),
    // Content
    React.createElement(
      'div',
      {
        style: {
          padding: '16px 20px',
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize,
          lineHeight: 1.6,
          color: textColor,
          whiteSpace: 'pre',
        },
      },
      visibleLines.join('\n'),
      !allDone && cursorBlink
        ? React.createElement(
            'span',
            { style: { color: '#6366f1' } },
            '\u2588',
          )
        : null,
    ),
  );
};

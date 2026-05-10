import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export interface MathTextProps {
  text: string | undefined;
}

// Inline math is rejected if the content is suspiciously long — likely a runaway match
// caused by an unbalanced $ in the source text (e.g. missing closing delimiter).
const MAX_INLINE_MATH_LENGTH = 300;

type MathSegment = { start: number; end: number; math: string; display: boolean };

function parseMathSegments(text: string): MathSegment[] {
  const segments: MathSegment[] = [];

  const displayRe = /\$\$([\s\S]+?)\$\$/g;
  let m: RegExpExecArray | null;
  while ((m = displayRe.exec(text)) !== null) {
    segments.push({ start: m.index, end: m.index + m[0].length, math: m[1], display: true });
  }

  const covered = (pos: number) => segments.some((s) => pos >= s.start && pos < s.end);
  const inlineRe = /\$((?:[^$]|\\.)+?)\$/g;
  let im: RegExpExecArray | null;
  while ((im = inlineRe.exec(text)) !== null) {
    if (!covered(im.index) && im[1].length <= MAX_INLINE_MATH_LENGTH) {
      segments.push({ start: im.index, end: im.index + im[0].length, math: im[1], display: false });
    }
  }

  return segments.sort((a, b) => a.start - b.start);
}

function renderKatex(math: string, display: boolean): string {
  try {
    return katex.renderToString(math, {
      displayMode: display,
      throwOnError: false,
      output: 'html',
    });
  } catch {
    return math;
  }
}

/** Renders text with inline ($...$) and display ($$...$$) LaTeX math. */
export const MathText = React.memo(({ text }: MathTextProps) => {
  if (!text) return null;

  const mathSegments = parseMathSegments(text);
  const parts: React.ReactNode[] = [];
  let last = 0;

  for (const seg of mathSegments) {
    if (seg.start > last) parts.push(text.slice(last, seg.start));

    const html = renderKatex(seg.math, seg.display);
    const Tag = seg.display ? 'div' : 'span';
    parts.push(<Tag key={seg.start} dangerouslySetInnerHTML={{ __html: html }} />);

    last = seg.end;
  }

  if (last < text.length) parts.push(text.slice(last));

  return <>{parts}</>;
});

MathText.displayName = 'MathText';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

async function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = [...container.querySelectorAll('img')];
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            }),
    ),
  );
}

/**
 * Collect the bottom-edge pixel positions (relative to element top) of all
 * question blocks, so the slicer can cut between them rather than mid-element.
 */
function getBlockBreakPoints(element: HTMLElement, scale: number): number[] {
  const containerTop = element.getBoundingClientRect().top;
  const blocks = element.querySelectorAll<HTMLElement>('[data-pdf-block="question"]');
  const points: number[] = [];
  for (const block of blocks) {
    const rect = block.getBoundingClientRect();
    // bottom of this block relative to container top, scaled to canvas pixels
    const bottomPx = (rect.bottom - containerTop) * scale;
    points.push(bottomPx);
  }
  return points;
}

/**
 * Given a naive page-boundary pixel (sliceEnd), find the largest safe cut point
 * that is <= sliceEnd. Falls back to sliceEnd if no block boundary fits.
 */
function safeCutPoint(sliceEnd: number, breakPoints: number[], offsetY: number): number {
  // Only consider break points above the naive cut that are after current offset
  const candidates = breakPoints.filter((p) => p > offsetY && p <= sliceEnd);
  if (candidates.length === 0) return sliceEnd; // no block fits cleanly — cut anyway
  return Math.max(...candidates);
}

/**
 * Rasterizes a DOM subtree (e.g. exam paper) to a multi-page A4 PDF and triggers download.
 *
 * Slices at question-block boundaries (via [data-pdf-block] elements) to avoid
 * cutting images or text mid-element. Falls back to a fixed cut if a single
 * question is taller than a full page.
 */
export async function renderExamPdfElement(
  element: HTMLElement,
  fileName: string,
  options?: { footer?: { line1: string; line2: string } },
): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined);
  }

  await waitForImages(element);
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

  const scale = 1.5;

  // Collect break points BEFORE html2canvas (while DOM is still positioned)
  const breakPoints = getBlockBreakPoints(element, scale);

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const margin = 10;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const mmPerPx = usableWidth / canvas.width;
  const maxSlicePx = Math.floor(usableHeight / mmPerPx);

  let offsetY = 0;
  let pageNum = 0;

  while (offsetY < canvas.height) {
    if (pageNum > 0) pdf.addPage();

    const naiveCut = offsetY + maxSlicePx;
    // Find the nearest safe cut at or before the naive cut
    const cutAt = safeCutPoint(Math.min(naiveCut, canvas.height), breakPoints, offsetY);
    const sliceH = cutAt - offsetY;

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceH;
    const ctx = sliceCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    ctx.drawImage(canvas, 0, offsetY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

    const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.85);
    const sliceHeightMm = sliceH * mmPerPx;
    pdf.addImage(sliceData, 'JPEG', margin, margin, usableWidth, sliceHeightMm);

    offsetY = cutAt;
    pageNum++;
  }

  if (options?.footer) {
    const { line1, line2 } = options.footer;
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);
    const cx = pageWidth / 2;
    const bottomY = pageHeight - margin - 6;
    pdf.text(line1, cx, bottomY, { align: 'center' });
    pdf.text(line2, cx, bottomY + 5, { align: 'center' });
  }

  pdf.save(fileName);
}

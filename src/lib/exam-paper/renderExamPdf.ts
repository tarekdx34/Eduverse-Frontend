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
 * Rasterizes a DOM subtree (e.g. exam paper) to a multi-page A4 PDF and triggers download.
 *
 * Each A4 page is rendered as a separate JPEG slice of the full canvas (no y-offset overlap),
 * which eliminates duplicate content at page boundaries. The optional footer is added via
 * jsPDF text on the last page so it appears exactly once.
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

  // mm per canvas pixel — used to convert between pixel rows and mm positions
  const mmPerPx = usableWidth / canvas.width;
  // How many canvas pixels fit in one page's usable height
  const slicePxHeight = Math.floor(usableHeight / mmPerPx);

  let offsetY = 0;
  let pageNum = 0;

  while (offsetY < canvas.height) {
    if (pageNum > 0) pdf.addPage();

    const sliceH = Math.min(slicePxHeight, canvas.height - offsetY);

    // Draw just this page's rows into a temporary canvas
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

    offsetY += slicePxHeight;
    pageNum++;
  }

  // Add footer text once on the last page
  if (options?.footer) {
    const { line1, line2 } = options.footer;
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81); // gray-700
    const cx = pageWidth / 2;
    const bottomY = pageHeight - margin - 6;
    pdf.text(line1, cx, bottomY, { align: 'center' });
    pdf.text(line2, cx, bottomY + 5, { align: 'center' });
  }

  pdf.save(fileName);
}

import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, TabStopType, TabStopPosition } from 'docx';

// Set up PDF.js worker using Vite's URL import pointing to node_modules
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const convertPdfToDocx = async (file: File): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  const paragraphs: any[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    // 1. Filter out empty items
    const items = content.items.filter((item: any) => 'str' in item && item.str.trim() !== '');
    if (items.length === 0) continue;

    // 2. Sort visually: top to bottom (Y descending in PDF space)
    items.sort((a: any, b: any) => b.transform[5] - a.transform[5]);

    // 3. Group into lines by Y coordinate
    const lines: any[][] = [];
    let currentLine: any[] = [];
    let currentY = -1;

    for (const item of items) {
      if (currentY === -1) {
        currentY = item.transform[5];
        currentLine.push(item);
      } else if (Math.abs(item.transform[5] - currentY) < 6) { // Tolerance of 6 pts
        currentLine.push(item);
      } else {
        lines.push(currentLine);
        currentLine = [item];
        currentY = item.transform[5];
      }
    }
    if (currentLine.length > 0) lines.push(currentLine);

    let lastLineY = -1;

    // 4. Process each line
    for (const line of lines) {
      if (line.length === 0) continue;
      
      // Sort left to right
      line.sort((a, b) => a.transform[4] - b.transform[4]);

      const children: TextRun[] = [];
      const tabStops: any[] = [];
      
      const firstItem = line[0];
      const pageMarginX = 36; // 0.5 inch typical margin (36pt)
      const leftIndentTwips = Math.max(0, Math.round((firstItem.transform[4] - pageMarginX) * 20));

      let lastEnd = -1;
      
      for (let j = 0; j < line.length; j++) {
        const item = line[j];
        const rawSize = item.transform[0]; 
        const pointSize = rawSize ? Math.max(8, Math.round(rawSize)) : 12;
        const fontName = (item.fontName || "").toLowerCase();

        if (j > 0) {
          const gap = item.transform[4] - lastEnd;
          if (gap > 12) {
             // Substantial gap -> Tab Stop
             const tabPosTwips = Math.max(0, Math.round((item.transform[4] - pageMarginX) * 20));
             tabStops.push({
               type: TabStopType.LEFT,
               position: tabPosTwips,
             });
             children.push(new TextRun({ text: "\t" }));
          } else if (gap > 2) {
             // Small gap -> Space
             children.push(new TextRun({ text: " " }));
          }
        }

        children.push(new TextRun({
          text: item.str,
          bold: fontName.includes('bold'),
          italics: fontName.includes('italic'),
          size: pointSize * 2,
          font: "Times New Roman"
        }));

        lastEnd = item.transform[4] + (item.width || item.str.length * (pointSize * 0.5));
      }

      // Calculate exact vertical spacing from previous line
      const currentLineY = firstItem.transform[5];
      let spacingBeforeTwips = 0; 
      
      if (lastLineY !== -1) {
          const verticalGap = lastLineY - currentLineY;
          const assumedLineHeight = firstItem.transform[0] || 12;
          
          if (verticalGap > assumedLineHeight * 1.2) {
              spacingBeforeTwips = Math.max(0, Math.round((verticalGap - assumedLineHeight) * 20));
          }
      }
      lastLineY = currentLineY;

      paragraphs.push(new Paragraph({
        children,
        indent: { left: leftIndentTwips },
        tabStops,
        spacing: { before: spacingBeforeTwips, after: 0 }
      }));
    }

    if (i < pdf.numPages && paragraphs.length > 0) {
       paragraphs.push(new Paragraph({ pageBreakBefore: true }));
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
         page: {
            margin: {
               top: 720,    // 0.5 inch -> 720 twips
               right: 720,
               bottom: 720,
               left: 720,   // matches pageMarginX (36 * 20 = 720)
            }
         }
      },
      children: paragraphs
    }],
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
          },
        },
      },
    }
  });

  return await Packer.toBlob(doc);
};

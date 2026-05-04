import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, ISectionOptions, AlignmentType } from 'docx';

// Set up PDF.js worker using Vite's URL import pointing to node_modules
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const convertPdfToDocx = async (file: File): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Load PDF document
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  const sections: ISectionOptions[] = [];
  const paragraphs: Paragraph[] = [];

  // Iterate over all pages
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    let currentY = -1;
    let currentLineItems: any[] = [];
    
    // Sort items visually from top to bottom, left to right
    const items = content.items.sort((a: any, b: any) => {
      const yDiff = b.transform[5] - a.transform[5]; // sort by Y descending
      if (Math.abs(yDiff) > 5) {
         return yDiff;
      }
      return a.transform[4] - b.transform[4]; // sort by X ascending
    });

    for (const item of items) {
      if (!('str' in item)) continue;

      if (currentY === -1) {
        currentY = item.transform[5];
      }

      // If Y coordinate changes significantly, treat as a new line/paragraph
      if (Math.abs(item.transform[5] - currentY) > 8) {
        if (currentLineItems.length > 0) {
          paragraphs.push(createParagraph(currentLineItems));
        }
        currentLineItems = [item];
        currentY = item.transform[5];
      } else {
        currentLineItems.push(item);
      }
    }
    
    // Push the remaining items in the last line
    if (currentLineItems.length > 0) {
      paragraphs.push(createParagraph(currentLineItems));
    }
    
    // Add page break if it's not the last page
    if (i < pdf.numPages) {
       paragraphs.push(new Paragraph({ pageBreakBefore: true }));
    }
  }

  // Create the docx Document
  const doc = new Document({
    sections: [{
      properties: {},
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

  // Export to Blob
  return await Packer.toBlob(doc);
};

// Helper function to create a docx Paragraph from structured PDF text items
function createParagraph(items: any[]): Paragraph {
  const children = items.map(item => {
    const fontName = (item.fontName || "").toLowerCase();
    const isBold = fontName.includes('bold');
    const isItalic = fontName.includes('italic');
    
    // Estimate size constraints: roughly mapping PDF scale to half-points (docx uses 1/2 pts)
    const rawSize = item.transform[0]; 
    const pointSize = rawSize ? Math.max(10, Math.round(rawSize)) : 12;

    return new TextRun({
      text: item.str,
      bold: isBold,
      italics: isItalic,
      size: pointSize * 2,
      font: "Times New Roman" // Ensuring Times New Roman 
    });
  });

  return new Paragraph({
    children,
    spacing: { after: 120 }
  });
}

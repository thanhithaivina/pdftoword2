import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, ISectionOptions, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';

// Set up PDF.js worker using Vite's URL import pointing to node_modules
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const convertPdfToDocx = async (file: File): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Load PDF document
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  const paragraphs: any[] = []; // Array of Paragraph or Table

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    // 1. Sort items visually from top to bottom, left to right
    const items = content.items.sort((a: any, b: any) => {
      const yDiff = b.transform[5] - a.transform[5]; // sort by Y descending
      if (Math.abs(yDiff) > 5) {
         return yDiff;
      }
      return a.transform[4] - b.transform[4]; // sort by X ascending
    });

    // 2. Group into lines
    const lines: any[][] = [];
    let currentLine: any[] = [];
    let currentY = -1;

    for (const item of items) {
      if (!('str' in item)) continue;
      if (item.str.trim() === '') continue; // Skip empty string

      if (currentY === -1) {
        currentY = item.transform[5];
      }

      if (Math.abs(item.transform[5] - currentY) > 8) {
        if (currentLine.length > 0) lines.push(currentLine);
        currentLine = [item];
        currentY = item.transform[5];
      } else {
        currentLine.push(item);
      }
    }
    if (currentLine.length > 0) lines.push(currentLine);

    // 3. Split lines into horizontal blocks (columns)
    const structuredLines = lines.map(line => {
      line.sort((a, b) => a.transform[4] - b.transform[4]);
      const blocks: any[][] = [];
      let currentBlock: any[] = [];
      let lastX = -1;
      let lastWidth = 0;

      for (const item of line) {
        if (lastX === -1) {
          currentBlock.push(item);
          lastX = item.transform[4];
          lastWidth = item.width || 0;
          continue;
        }

        const gap = item.transform[4] - (lastX + lastWidth);
        // Column gap threshold
        if (gap > 20) { 
          blocks.push(currentBlock);
          currentBlock = [item];
        } else {
          currentBlock.push(item);
        }
        lastX = item.transform[4];
        lastWidth = item.width || 0;
      }
      if (currentBlock.length > 0) blocks.push(currentBlock);
      return blocks;
    });

    // 4. Group consecutive lines vertically into "sections" (paragraphs or tables)
    const verticalGroups: any[][][] = []; 
    let currentGroup: any[][] = [];
    let lastY = -1;

    for (const blocks of structuredLines) {
       // using the first item's Y as line Y
       const lineY = blocks[0] && blocks[0][0] ? blocks[0][0].transform[5] : 0;
       if (lastY === -1) {
           currentGroup.push(blocks);
           lastY = lineY;
           continue;
       }

       // Large vertical gap -> new group
       const yDiff = Math.abs(lastY - lineY);
       if (yDiff > 25) { 
           verticalGroups.push(currentGroup);
           currentGroup = [blocks];
       } else {
           currentGroup.push(blocks);
       }
       lastY = lineY;
    }
    if (currentGroup.length > 0) verticalGroups.push(currentGroup);

    // 5. Process each vertical group
    for (const group of verticalGroups) {
        let maxCols = 0;
        group.forEach(line => {
            if (line.length > maxCols) maxCols = line.length;
        });

        if (maxCols <= 1) {
            // It's a regular text section
            const allItems: any[] = [];
            group.forEach((line, index) => {
                if (line[0]) allItems.push(...line[0]);
                if (index < group.length - 1) {
                    // Add a space between lines in the same paragraph block
                    allItems.push({ 
                        str: " ", 
                        fontName: line[0] && line[0][0] ? line[0][0].fontName : "", 
                        transform: [12,0,0,12,0,0], 
                        width: 5 
                    });
                }
            });
            if (allItems.length > 0) paragraphs.push(createParagraph(allItems));
        } else {
            // It's a table
            const allX: number[] = [];
            group.forEach(line => {
                line.forEach(block => {
                    if (block.length > 0) allX.push(block[0].transform[4]);
                });
            });

            allX.sort((a, b) => a - b);
            const columns: number[] = [];
            for (const x of allX) {
                if (columns.length === 0) {
                    columns.push(x);
                } else {
                    const lastCol = columns[columns.length - 1];
                    if (x - lastCol > 20) {
                        columns.push(x);
                    }
                }
            }

            const docxRows = group.map(line => {
                const cells: any[] = new Array(columns.length).fill(null);
                
                line.forEach((block) => {
                    if (block.length === 0) return;
                    const x = block[0].transform[4];
                    let bestColIdx = 0;
                    let minDiff = Infinity;
                    for (let i = 0; i < columns.length; i++) {
                        const diff = Math.abs(x - columns[i]);
                        if (diff < minDiff) {
                            minDiff = diff;
                            bestColIdx = i;
                        }
                    }
                    
                    if (cells[bestColIdx]) {
                        cells[bestColIdx].push(...block);
                    } else {
                        cells[bestColIdx] = [...block];
                    }
                });

                return new TableRow({
                    children: cells.map(cellBlock => {
                        return new TableCell({
                            children: cellBlock && cellBlock.length > 0 ? [createParagraph(cellBlock)] : [new Paragraph("")],
                            borders: {
                                top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                                bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                                left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                                right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
                            },
                        });
                    })
                });
            });

            if (docxRows.length > 0) {
              paragraphs.push(new Table({
                 rows: docxRows,
                 width: { size: 100, type: WidthType.PERCENTAGE },
              }));
              paragraphs.push(new Paragraph("")); // space after table
            }
        }
    }

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

  return await Packer.toBlob(doc);
};

// Helper function to create a docx Paragraph from structured PDF text items
function createParagraph(items: any[]): Paragraph {
  const children: TextRun[] = [];
  
  let lastEnd = -1;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Check horizontal gap for space insertion if it's the same line roughly
    if (lastEnd !== -1 && item.transform[4] !== 0) { 
      if (item.transform[4] - lastEnd > 4 && item.str.trim() !== '') {
         children.push(new TextRun({ text: " " }));
      }
    }
    
    const fontName = (item.fontName || "").toLowerCase();
    const isBold = fontName.includes('bold');
    const isItalic = fontName.includes('italic');
    
    const rawSize = item.transform[0]; 
    const pointSize = rawSize ? Math.max(10, Math.round(rawSize)) : 12;

    children.push(new TextRun({
      text: item.str,
      bold: isBold,
      italics: isItalic,
      size: pointSize * 2,
      font: "Times New Roman"
    }));

    if (item.transform[4] !== 0) {
      lastEnd = item.transform[4] + (item.width || 0);
    } else {
      lastEnd = -1; // reset for next item
    }
  }

  return new Paragraph({
    children,
    spacing: { after: 120 }
  });
}

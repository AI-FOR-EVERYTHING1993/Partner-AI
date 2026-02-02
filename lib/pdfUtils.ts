// Simple PDF text extraction without canvas dependencies
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Simple text extraction - look for text between stream markers
    const text = new TextDecoder().decode(uint8Array);
    const textMatches = text.match(/BT[\s\S]*?ET/g) || [];
    
    let extractedText = '';
    textMatches.forEach(match => {
      const lines = match.split('\n');
      lines.forEach(line => {
        if (line.includes('Tj') || line.includes('TJ')) {
          const textMatch = line.match(/\(([^)]+)\)/g);
          if (textMatch) {
            textMatch.forEach(t => {
              extractedText += t.replace(/[()]/g, '') + ' ';
            });
          }
        }
      });
    });
    
    if (!extractedText.trim()) {
      // Fallback: extract any readable text
      const readableText = text.replace(/[\x00-\x1F\x7F-\xFF]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return readableText.substring(0, 5000); // Limit size
    }
    
    return extractedText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const analyzePDFContent = async (file: File) => {
  try {
    const text = await extractTextFromPDF(file);
    
    return {
      text,
      pages: 1, // Simplified
      wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
      characterCount: text.length
    };
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    throw new Error('Failed to analyze PDF content');
  }
};
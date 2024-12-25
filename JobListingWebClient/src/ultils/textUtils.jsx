export const stripHtmlAndTruncate = (text, maxLength = 150) => {
    if (!text) return '';
  
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    
    let plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    plainText = plainText.replace(/\s+/g, ' ').trim();
    
    plainText = plainText.replace(/([.!?])\s*([a-zA-Z])/g, '$1 $2');
    
    if (plainText.length > maxLength) {
      const truncated = plainText.slice(0, maxLength);
      const lastSentenceBreak = Math.max(
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf(','),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf(')'),
        truncated.lastIndexOf('/n'),
        truncated.lastIndexOf('?')
      );
      
      return lastSentenceBreak > 0 
        ? truncated.slice(0, lastSentenceBreak + 1).trim() + '...'
        : truncated.trim() + '...';
    }
    
    return plainText;
  };
/**
 * Highlights search terms in text
 */
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const escapedQuery = escapeRegex(query);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    // Check if this part matches the query (case-insensitive)
    if (part.toLowerCase() === query.toLowerCase()) {
      return `<mark class="bg-yellow-300 text-gray-900 font-semibold px-0.5 rounded">${escapeHtml(part)}</mark>`;
    }
    return escapeHtml(part);
  }).join('');
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Escapes special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Searches text for query (case-insensitive)
 */
export function searchText(text: string, query: string): boolean {
  if (!query.trim()) return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

/**
 * Gets all indices where query appears in text
 */
export function getSearchIndices(text: string, query: string): number[] {
  if (!query.trim()) return [];
  
  const indices: number[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let index = lowerText.indexOf(lowerQuery);
  
  while (index !== -1) {
    indices.push(index);
    index = lowerText.indexOf(lowerQuery, index + 1);
  }
  
  return indices;
}


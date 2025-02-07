export const validateAndTransformUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://www.${url}`;
  }
  if (!url.endsWith('.com') && !url.endsWith('.org') && !url.endsWith('.net') && !url.endsWith('.edu')) {
    url = `${url}.com`;
  }
  try {
    new URL(url);
    return url;
  } catch {
    throw new Error('Invalid URL format');
  }
};
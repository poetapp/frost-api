export const sanetizeText = (text: string): string => {
  return text.replace(/[\r\n\s]/g, '')
}

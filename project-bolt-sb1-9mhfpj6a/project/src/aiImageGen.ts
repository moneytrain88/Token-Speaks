export function buildCharacterImageUrl(promptText: string): string {
  const cleanPrompt = encodeURIComponent(
    `${promptText}, front facing symmetrical character portrait centered in frame, expressive face, vibrant digital illustration, clean solid dark background, no text, no watermark`
  );
  const seed = Math.floor(Math.random() * 100000);
  return `https://pollinations.ai{cleanPrompt}?width=400&height=400&seed=${seed}&nologo=true`;
}

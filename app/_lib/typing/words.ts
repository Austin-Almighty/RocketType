import { top1kWords, top5kWords } from "../../_ui/words";

export type WordSet = "1k" | "5k";

export function wordListFor(set: WordSet | null): string[] {
  return set === "5k" ? top5kWords : top1kWords;
}

// Fisher-Yates shuffle, then take the first `count` words.
export function getRandomWords(words: string[], count: number): string[] {
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

import { parse } from "./parse";
export class Concordance {
  concordance: {
    lemma: string[];
    morph: string[];
    text: string;
    textNormalized: string;
    verse: string;
  }[] = [];

  constructor(data) {
    const chapters = parse(data).getElementsByTagName("chapter");

    Array.from(chapters).forEach((chapter) => {
      let verse = { id: chapter.getAttribute("osisID") };
      const elements = Array.from(chapter.children).forEach((child) => {
        if (child.tagName === "verse") {
          verse = { id: child.getAttribute("osisID") };
        } else if (child.tagName === "w") {
          const word = child;
          const lemma = word.getAttribute("lemma");
          const morph = word.getAttribute("morph");
          const entry = {
            lemma: typeof lemma === "string" ? lemma.split(" ") : [],
            morph: typeof morph === "string" ? morph.split(" ") : [],
            text: word.textContent,
            textNormalized: word.textContent.toLocaleLowerCase(),
            verse: verse.id,
          };

          this.concordance.push(entry);
        }
      });
    });
  }

  searchByText(text: string) {
    const normalizedText = text.toLocaleLowerCase(); // todo convert to regex and make sure that the text is bounded by word separators
    return this.concordance.filter((entry) => {
      if (entry.textNormalized.indexOf(normalizedText) !== -1) {
        return true;
      }
    });
  }

  searchByLemma(text: string) {
    const normalizedText = text.toLocaleUpperCase(); // todo convert to regex and make sure that the text is bounded by word separators
    return this.concordance.filter((entry) => {
      if (entry.lemma.find((l) => l.toLocaleUpperCase() === normalizedText)) {
        return true;
      }
    });
  }

  searchByMorph(text: string) {
    const normalizedText = text.toLocaleUpperCase(); // todo convert to regex and make sure that the text is bounded by word separators
    return this.concordance.filter((entry) => {
      if (
        entry.morph.find((l) =>
          l.toLocaleUpperCase().startsWith(normalizedText)
        )
      ) {
        return true;
      }
    });
  }
}

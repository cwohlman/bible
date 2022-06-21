import { parse } from "./parse";
export type LemmaEntry = {
  id: number;
  lemma: string[];
  morph: string[];
  text: string;
  textNormalized: string;
  verse: string;
};

export class Concordance {
  concordance: LemmaEntry[] = [];

  constructor(data) {
    const chapters = parse(data).getElementsByTagName("chapter");

    Array.from(chapters).forEach((chapter) => {
      let verse = { id: chapter.getAttribute("osisID") };
      const elements = Array.from(chapter.childNodes).forEach((child) => {
        if (child instanceof Element) {
          if (child.tagName === "verse") {
            verse = { id: child.getAttribute("osisID") };
          } else if (child.tagName === "w") {
            const word = child;
            const lemma = word.getAttribute("lemma");
            const morph = word.getAttribute("morph");
            const entry = {
              id: this.concordance.length,
              lemma:
                typeof lemma === "string"
                  ? lemma.split(" ").filter((a, i, array) => {
                      return array.indexOf(a) == i;
                    })
                  : [],
              morph:
                typeof morph === "string"
                  ? morph.split(" ").filter((a, i, array) => {
                      return array.indexOf(a) == i;
                    })
                  : [],
              text: word.textContent || "",
              textNormalized: word.textContent?.toLocaleLowerCase() || "",
              verse: verse.id || "Invalid",
            };

            this.concordance.push(entry);
          }
        } else if (child instanceof Text && child.wholeText.trim() != "") {
          const lemma = "~";
          const morph = "";
          const entry = {
            id: this.concordance.length,
            lemma:
              typeof lemma === "string"
                ? lemma.split(" ").filter((a, i, array) => {
                    return array.indexOf(a) == i;
                  })
                : [],
            morph:
              typeof morph === "string"
                ? morph.split(" ").filter((a, i, array) => {
                    return array.indexOf(a) == i;
                  })
                : [],
            text: child.wholeText || "",
            textNormalized: child.wholeText?.toLocaleLowerCase() || "",
            verse: verse.id || "Invalid",
          };

          this.concordance.push(entry);
        }
      });
    });
  }

  /**
   * Gets a single verse by the reference (normalized)
   * @param verse the reference for the verse to be returned
   * @returns the set of lemmas, in order, which represent the verse
   */
  getVerse(verse: string): LemmaEntry[] {
    return this.concordance.filter((a) => a.verse == verse);
  }

  /**
   * Gets a slice of verses by id (index)
   * @param start The id of the first verse to be returned
   * @param end The id of the last verse to be returned
   */
  getVersesById(start: number, end: number): LemmaEntry[] {
    // slice returns elements exclusive of the last element, but we want to include it.
    return this.concordance.slice(start, end + 1);
  }

  searchForLemma(text: string) {
    if (text.match(/(G|H)\d+/i)) {
      return this.searchByLemma("strong:" + text);
    }

    if (text.match(/strong:/i)) {
      return this.searchByLemma(text);
    }

    if (text.match(/strongMorph\:|robinson\:/i)) {
      return this.searchByMorph(text);
    }

    if (text.length < 3) {
      return "Very short terms do not work well. Please use a longer term.";
    }

    return this.searchByText(text);
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

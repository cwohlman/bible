import { parse } from "./parse";

export type LemmaEntry = {
  id: number;
  reference: string;
  position: number;
  translation: string;
  lemma: string[];
  morph: string[];
};

export type VerseEntry = {
  reference: string;
  words: LemmaEntry[];
}

export class Concordance {
  translationIndex: { [translation: string]: LemmaEntry[] } = {};
  translationList: string[] = [];

  lemmaIndex: { [lemma: string]: LemmaEntry[] } = {};
  
  morphIndex: { [morphCode: string]: LemmaEntry[] } = {};

  verseReferenceIndex: { [verseRef: string]: VerseEntry } = {};
  verseReferenceList: string[] = [];

  verseList: VerseEntry[] = [];
  lemmaList: LemmaEntry[] = [];

  constructor(data) {
    const chapters = parse(data).getElementsByTagName("chapter");

    Array.from(chapters).forEach((chapter) => {
      let verseId = chapter.getAttribute("osisID");
      let verse: VerseEntry = this.addVerse(verseId);
      
      Array.from(chapter.childNodes).forEach((child) => {
        if (child instanceof Element) {
          if (child.tagName === "verse") {
            verse = this.addVerse(child.getAttribute("osisID"));
          } else if (child.tagName === "w") {
            const word = child;
            const lemma = word.getAttribute("lemma");
            const morph = word.getAttribute("morph");
            
            
            this.addLemma(verse, word.textContent || "", lemma, morph);
          }
        } else if (child instanceof Text && child.wholeText.trim() != "") {
          this.addLemma(verse, child.wholeText, null, null);
        }
      });

      this.translationList = Object.keys(this.translationIndex);
      this.verseReferenceList = Object.keys(this.verseReferenceIndex);
    });
  }

  addVerse(verseId: string | null): VerseEntry {
    const entry = { reference: verseId || "invalid:" + this.verseList.length, words: [] };

    this.verseList.push(entry);
    this.verseReferenceIndex[entry.reference] = entry;

    return entry;
  }

  addLemma(verse: VerseEntry, translation: string, lemma: string | null, morph: string | null)
  {
    const entry: LemmaEntry = {
      id: this.lemmaList.length,
      reference: verse.reference,
      position: verse.words.length,
      translation,
      lemma: this.parseLemma(lemma),
      morph: this.parseMorphCodes(morph),
    };

    verse.words.push(entry);
    this.lemmaList.push(entry);

    const normalizedTranslation = translation.toLocaleLowerCase();
    const translationIndexEntry = (this.translationIndex[normalizedTranslation] = this.translationIndex[normalizedTranslation] || []);
    translationIndexEntry.push(entry);

    entry.lemma.forEach(lemma => {
      const lemmaIndexEntry = (this.lemmaIndex[lemma] = this.lemmaIndex[lemma] || []);
      lemmaIndexEntry.push(entry);
    })

    entry.morph.forEach(morph => {
      const morphIndexEntry = (this.morphIndex[morph] = this.morphIndex[morph] || []);
      morphIndexEntry.push(entry);
    })

    return entry;
  }
  parseMorphCodes(morph: string | null): string[] {
    if (! morph) return [];

    return morph.split(/\s/).filter(a => a);
  }
  parseLemma(lemma: string | null): string[] {
    if (! lemma) return [];

    return lemma.split(/\s/).filter(a => a);
  }

  /**
   * Gets a single verse by the reference (normalized)
   * @param verse the reference for the verse to be returned
   * @returns the set of lemmas, in order, which represent the verse
   */
  getVerse(verse: string): LemmaEntry[] {
    throw new Error("Not implemented");
  }

  /**
   * Gets a slice of verses by id (index)
   * @param start The id of the first verse to be returned
   * @param end The id of the last verse to be returned
   */
  getLemmasById(start: number, end: number): LemmaEntry[] {
    // slice returns elements exclusive of the last element, but we want to include it.
    return this.lemmaList.slice(start, end + 1);
  }

  searchForLemma(text: string) {
    // todo: split by whitespace & apply search type
    // search rules:
    // `word` should match whole word
    // `word*` should match starts with "word"
    // `"some words"` should match whole translation
    // `~word` should match fuzzy
    // `[word word]` should match translation, provided both words are in it (words could be of different types, e.g. strongs, morph, etc.)

    if (text.match(/(G|H)\d+/i)) {
      return this.searchByLemma("strong:" + text);
    }

    if (text.match(/strong:/i)) {
      return this.searchByLemma(text);
    }

    if (text.match(/strongMorph\:|robinson\:/i)) {
      return this.searchByMorph(text);
    }

    return this.searchByText(text);
  }

  searchByText(text: string) {
    const normalizedText = text.toLocaleLowerCase(); // todo convert to regex and make sure that the text is bounded by word separators
    const matchingTranslations = this.translationList.filter(a => a.indexOf(normalizedText) != -1);
    
    return matchingTranslations.map(a => this.translationIndex[a]).flat().sort((a, b) => a.id - b.id);
  }

  searchByLemma(text: string) {
    const normalizedText = text.toLocaleUpperCase(); // todo convert to regex and make sure that the text is bounded by word separators
    return this.lemmaIndex[normalizedText] || [];
  }

  searchByMorph(text: string) {
    const normalizedText = text.toLocaleUpperCase(); // todo convert to regex and make sure that the text is bounded by word separators
    return this.morphIndex[normalizedText] || [];
  }
}

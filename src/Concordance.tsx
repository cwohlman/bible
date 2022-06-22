import { parse } from "./parse";
import MiniSearch from "minisearch";
import { SearchType } from "./Study";
import * as _ from "lazy.js";
import { FilterIcon, TerminalIcon } from "@heroicons/react/outline";

export type LemmaEntry = {
  id: number;
  reference: string;
  position: number;
  translation: string;
  words: string[];
  lemma: string[];
  morph: string[];
};

export type VerseEntry = {
  reference: string;
  text: string;
  words: LemmaEntry[];
};

export type SearchResult = {
  id: number;
  reference: string;
  relevence: number;
  match: LemmaEntry[];
};

export type SearchResults = {
  search: string;
  searchType: SearchType;

  time: number;

  results: SearchResult[];
};

export class Concordance {
  wordIndex: { [word: string]: LemmaEntry[] } = {};
  wordList: string[] = [];

  translationIndex: { [translation: string]: LemmaEntry[] } = {};
  translationList: string[] = [];

  lemmaIndex: { [lemma: string]: LemmaEntry[] } = {};

  morphIndex: { [morphCode: string]: LemmaEntry[] } = {};

  verseReferenceIndex: { [verseRef: string]: VerseEntry } = {};
  verseReferenceList: string[] = [];

  verseList: VerseEntry[] = [];
  lemmaList: LemmaEntry[] = [];

  textIndex: MiniSearch<VerseEntry>;

  constructor(data) {
    const chapters = parse(data).getElementsByTagName("chapter");

    // this.textIndex = new MiniSearch();

    Array.from(chapters).forEach((chapter) => {
      let verseId = chapter.getAttribute("osisID");

      this.currentVerse = this.addVerse(verseId);

      Array.from(chapter.childNodes).forEach((child) => this.parseNode(child));

      this.translationList = Object.keys(this.translationIndex);
      this.verseReferenceList = Object.keys(this.verseReferenceIndex);
      this.wordList = Object.keys(this.wordIndex);
    });
  }

  currentVerse: VerseEntry;
  parseNode(child: Node) {
    if (child instanceof Element) {
      if (child.tagName === "verse") {
        this.currentVerse = this.addVerse(child.getAttribute("osisID"));
        this.currentVerse.text = child.textContent || "";
      } else if (child.tagName === "w") {
        const word = child;
        const lemma = word.getAttribute("lemma");
        const morph = word.getAttribute("morph");

        this.addLemma(this.currentVerse, word.textContent || "", lemma, morph);
      } else if (child.tagName === "transChange") {
        const word = child;

        this.addLemma(this.currentVerse, word.textContent || "", null, null);
      } else if (child.tagName === "foreign") {
        const word = child;

        this.addLemma(this.currentVerse, word.textContent || "", null, null);
      } else if (child.tagName === "title") {
        child.childNodes.forEach((node) => this.parseNode(node));
      } else if (child.tagName === "q") {
        child.childNodes.forEach((node) => this.parseNode(node));
      } else if (child.tagName === "inscription") {
        child.childNodes.forEach((node) => this.parseNode(node));
      } else if (child.tagName === "divineName") {
        child.childNodes.forEach((node) => this.parseNode(node));
      } else if (child.tagName === "milestone") {
        // Ignore milestones
      } else if (child.tagName === "note") {
        // Ignore notes
      } else {
        throw new Error("Unrecognized node:" + child.tagName);
      }
    } else if (child instanceof Text) {
      if (child.wholeText.trim() != "")
        this.addLemma(this.currentVerse, child.wholeText, null, null);
    } else {
      throw new Error("Unrecognized node:" + child.nodeName);
    }
  }

  addVerse(verseId: string | null): VerseEntry {
    const entry = {
      reference: verseId || "invalid:" + this.verseList.length,
      text: "",
      words: [],
    };

    this.verseList.push(entry);
    this.verseReferenceIndex[entry.reference] = entry;

    return entry;
  }

  addLemma(
    verse: VerseEntry,
    translation: string,
    lemma: string | null,
    morph: string | null
  ) {
    const words = translation
      .split(/\s+/)
      .map((a) => a.match(/[a-z\-]+/i))
      .map((a) => a && a[0].toLocaleLowerCase())
      .filter((a) => a) as string[];

    const entry: LemmaEntry = {
      id: this.lemmaList.length,
      reference: verse.reference,
      position: verse.words.length,
      translation,
      words,
      lemma: this.parseLemma(lemma),
      morph: this.parseMorphCodes(morph),
    };

    verse.words.push(entry);
    this.lemmaList.push(entry);

    const normalizedTranslation = translation.toLocaleLowerCase();
    const translationIndexEntry = (this.translationIndex[
      normalizedTranslation
    ] = this.translationIndex[normalizedTranslation] || []);
    translationIndexEntry.push(entry);

    entry.words.forEach((word) => {
      const wordIndexEntry = (this.wordIndex[word] =
        this.wordIndex[word] || []);
      wordIndexEntry.push(entry);
    });

    entry.lemma.forEach((lemma) => {
      const lemmaIndexEntry = (this.lemmaIndex[lemma] =
        this.lemmaIndex[lemma] || []);
      lemmaIndexEntry.push(entry);
    });

    entry.morph.forEach((morph) => {
      const morphIndexEntry = (this.morphIndex[morph] =
        this.morphIndex[morph] || []);
      morphIndexEntry.push(entry);
    });

    return entry;
  }
  parseMorphCodes(morph: string | null): string[] {
    if (!morph) return [];

    return morph
      .split(/\s/)
      .filter((a) => a)
      .map(this.normalizeMorph);
  }
  parseLemma(lemma: string | null): string[] {
    if (!lemma) return [];

    return lemma
      .split(/\s/)
      .filter((a) => a)
      .map(this.normalizeLemma);
  }

  normalizeLemma(lemma: string): string {
    return lemma.replace("strong:H0", "H").replace("strong:", "");
  }
  normalizeMorph(lemma: string): string {
    return lemma.replace("strongMorph:", "").replace("robinson:", "");
  }

  /**
   * Gets a single verse by the reference (normalized)
   * @param verse the reference for the verse to be returned
   * @returns the set of lemmas, in order, which represent the verse
   */
  getVerse(verse: string): LemmaEntry[] {
    const exactVerse = this.verseReferenceIndex[verse];

    if (exactVerse) return exactVerse.words;

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

  // Search types:
  // all
  // any
  // phrase
  // literal (char for char, case sensitive, no normalization, no strongs numbers, no morphology codes, matches partial words, spaces, etc.)
  // advanced

  // Search:
  // each term can be:
  // strongs
  // morph
  // text (with optional wildcards)
  // lemma expression: [term term term] -> every term must match a single lemma (e.g. put both strongs and translation)
  // phrase expression: "term term term" -> every term must match in order (also no gaps, ignores punctuation)
  // and expression: (term term term) or all:term -> every term must match in any order
  // not expression !term or not:term -> term must not match
  // fuzzy expression ~term or fuzzy:term -> term may match fuzzy
  // or expression: |term or any:term -> at least one term must match only applies to lemma -and- and
  // scope expression: ^terms or #terms -> sub-term may match within 2 verses, or a chapter only applicable for and, or, and phrase (by default all terms must match within a single verse)

  searchByText(text: string) {
    const normalizedText = text.toLocaleLowerCase(); // todo convert to regex and make sure that the text is bounded by word separators
    const matchingTranslations = this.translationList.filter(
      (a) => a.indexOf(normalizedText) != -1
    );

    return matchingTranslations
      .map((a) => this.translationIndex[a])
      .flat()
      .sort((a, b) => a.id - b.id);
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

export class Search {
  constructor(public concordance: Concordance) {}

  test: (entry: LemmaEntry) => boolean;

  filter: (entry: LemmaEntry[]) => LemmaEntry[] = (entries) =>
    entries.filter(this.test);

  prepass = () => _(this.concordance.lemmaList);

  prepassFilter = (a: LemmaEntry[]) => this.filter(a);

  search(): SearchResult[] {
    return this.prepass()
      .map((a) => this.filter([a]))
      .filter(any)
      .map((match) => ({
        id: (match as LemmaEntry[])[0].id,
        match: match as LemmaEntry[],
        reference: (match as LemmaEntry[])[0].reference,
        relevence: 1,
      }))
      .toArray();
  }

  getFragment(entry: LemmaEntry): string[] | false {
    if (this.test(entry)) return [];

    return false;
  }

  consumeFragment(_fragment: string[]): string[] | false {
    return false;
  }

  static parse(
    input: string,
    index: Concordance,
    advanced: boolean = true
  ): Search {
    let parts: Search[] = [];

    if (advanced) {
      while (input) {
        const [words, remainder] = this.parseInner(input, index);

        parts.push(...words);
        input = remainder;
      }
    } else {
      parts = input.split(" ").map((a) => this.parseWord(a, index));
    }

    return new AndSearch(parts, false, index);
  }

  static parseInner(
    input: string,
    index: Concordance,
    closingChar?: string
  ): [Search[], string] {
    const results: Search[] = [];

    let i = 0;
    let negateNext = false;
    let anyNext = false;
    let currentWord = "";
    let prefix: string[] = [];
    while (i < input.length) {
      const next = input[i];
      if (next == closingChar || next == "]" || next == ")") {
        closeWord();

        return [results, getRemainder(true)];
      }
      if (next == "[") {
        const [children, remainder] = this.parseInner(getRemainder(), index);
        const child = new LemmaSearch(children, false, index);

        pushChild(child, remainder);
        continue;
      }
      if (next == "(") {
        const [children, remainder] = this.parseInner(getRemainder(), index);
        const child = new AndSearch(children, anyNext, index);

        pushChild(child, remainder);
        continue;
      }
      if (next == '"') {
        const [children, remainder] = this.parseInner(
          getRemainder(),
          index,
          '"'
        );
        const child = new PhraseSearch(children, anyNext, index);

        pushChild(child, remainder);
        continue;
      }

      // TODO: it isn't really valid to put these inside a word
      if (next == "!") {
        negateNext = true;
      }
      if (next == "|") {
        anyNext = true;
      }
      if (next == "&") {
        anyNext = false;
      }
      if (next == ":") {
        parsePrefix();
      }

      if (/\s/.test(next)) {
        closeWord();
        continue;
      }

      currentWord += next;
      i++;
    }

    return [results, getRemainder()];

    function getRemainder(includeCurrentChar: boolean = false): string {
      return input.slice(i + (includeCurrentChar ? 0 : 1));
    }

    function parsePrefix() {
      // prefixes are case insensitive
      currentWord = currentWord.toLocaleLowerCase();

      if (currentWord == "not") negateNext = true;
      else if (currentWord == "and") anyNext = false;
      else if (currentWord == "or") anyNext = true;
      else if (currentWord == "any") anyNext = true;
      else if (currentWord == "all") anyNext = false;
      else prefix.push(currentWord);

      currentWord = "";
    }

    function closeWord() {
      if (currentWord) {
        pushChild(Search.parseWord(currentWord, index));
        return true;
      } else {
        input = getRemainder();
        i = 0;
      }
    }

    function pushChild(child: Search, remainder: string = input.slice(i + 1)) {
      if (negateNext) child = new NotSearch(child, index);

      results.push(child);
      input = remainder;
      anyNext = false;
      negateNext = false;
      currentWord = "";
      prefix = [];
      i = 0;
    }
  }

  static parseWord(
    input: string,
    index: Concordance,
    prefixes: string[] = []
  ): Search {
    if (prefixes.includes("strong") || prefixes.includes("strongs"))
      return this.parseStrongs(input, index);
    if (
      prefixes.includes("morph") ||
      prefixes.includes("morphcode") ||
      prefixes.includes("robinson") ||
      prefixes.includes("strongMorph")
    )
      return this.parseMorph(input, index);
    if (prefixes.includes("in"))
      return this.parseReference(input, index);

    if (/^h\d+$/i.test(input)) return this.parseStrongs(input, index);
    if (/^g\d+$/i.test(input)) return this.parseStrongs(input, index);
    if (/^[a-z]+\.\d+(\.\d+)?$/i.test(input)) return this.parseReference(input, index);

    return new WordSearch(input, index);
  }

  static parseReference(input: string, index: Concordance): Search {
    return new ReferenceSearch(input, index);
  }

  static parseStrongs(input: string, index: Concordance): Search {
    return new StrongsSearch(index.normalizeLemma(input), index);
  }

  static parseMorph(input: string, index: Concordance): Search {
    return new MorphSearch(index.normalizeMorph(input), index);
  }
}

export function exists<T>(a: T | null): a is T {
  return !!a;
}
export function any<T>(a: T[]) {
  return !!a.length;
}

export class NotSearch extends Search {
  constructor(public term: Search, concordance: Concordance) {
    super(concordance);
  }

  test = (entry: LemmaEntry) => !this.term.test(entry);

  filter = (entries: LemmaEntry[]) =>
    this.term.filter(entries).length ? [] : entries;

  prepassFilter = this.term.prepassFilter;
}

export class WordSearch extends Search {
  constructor(public term: string, concordance: Concordance) {
    super(concordance);
  }

  test = (entry: LemmaEntry) => entry.words.indexOf(this.term) != -1;
  prepass = () => _(this.concordance.wordIndex[this.term]);

  // prepass is safe
  prepassFilter = (a) => a;

  consumeFragment(fragment: string[]) {
    if (fragment[0] == this.term) {
      return fragment.slice(1);
    }

    return false;
  }
  getFragment(entry: LemmaEntry) {
    let i = 0;
    while (i < entry.words.length) {
      if (entry.words[i] == this.term) {
        return entry.words.slice(i + 1);
      }
      i++;
    }

    return false;
  }
}

// TODO:
// export class FuzzySearch extends Search {
//   constructor(public term: string, concordance: Concordance) { super(concordance); }

//   test = (entry: LemmaEntry) => entry.words.indexOf(this.term) != -1;
//   prepass = () => _(this.concordance.wordIndex[this.term]);

//   consumeFragment(fragment: string[]) {
//     if (fragment[0] == this.term) {
//       return fragment.slice(1);
//     }

//     return false;
//   }
//   getFragment(entry: LemmaEntry) {
//     return this.consumeFragment(entry.words);
//   }
// }

export class StrongsSearch extends Search {
  constructor(public term: string, concordance: Concordance) {
    super(concordance);
  }

  test = (entry: LemmaEntry) => entry.lemma.indexOf(this.term) != -1;
  prepass = () => _(this.concordance.lemmaIndex[this.term]);
  // prepass is safe
  prepassFilter = (a) => a;
}

export class MorphSearch extends Search {
  constructor(public term: string, concordance: Concordance) {
    super(concordance);
  }

  test = (entry: LemmaEntry) => entry.morph.indexOf(this.term) != -1;
  prepass = () => _(this.concordance.morphIndex[this.term]);
  // prepass is safe
  prepassFilter = (a) => a;
}

export class ReferenceSearch extends Search {
  constructor(public term: string, concordance: Concordance) {
    super(concordance);
  }

  // TODO: support verse ranges
  test = (entry: LemmaEntry) => entry.reference.startsWith(this.term);
  prepass = () =>
    _(this.concordance.verseReferenceList)
      .filter((a) => a.startsWith(this.term))
      .map((a) => this.concordance.verseReferenceIndex[a].words[0]) as any;
  // prepass is safe
  prepassFilter = (a) => a;
}

export class MultiSearch extends Search {
  constructor(
    public terms: Search[],
    public any: boolean,
    concordance: Concordance
  ) {
    super(concordance);
  }

  prepass = () => {
    if (this.any && this.terms.length > 1) {
      let i = 1;
      let results = this.terms[0].prepass();

      type ResultType = typeof results;

      while (i < this.terms.length) {
        results = results.concat(this.terms[i].prepass().toArray());
        i++;
      }

      return results.uniq() as ResultType;
    }

    return this.terms[0].prepass();
  };
  prepassFilter = this.terms.length == 1 ? this.terms[0].prepassFilter : a => this.filter(a);

  expandToVerse = true;

  search(): SearchResult[] {
    if (this.terms.length == 1) return this.terms[0].search();

    let prepassResults = this.prepass();

    const searchSets = this.expandToVerse
      ? prepassResults
          .uniq("id")
          .map((a) => this.concordance.getVerse(a.reference))
      : prepassResults.map((a) => [a]);

    return searchSets
      .map((a) => this.filter(a))
      .filter(any)
      .map((match) => ({
        id: (match as LemmaEntry[])[0].id,
        match: match as LemmaEntry[],
        reference: (match as LemmaEntry[])[0].reference,
        relevence: 1,
      }))
      .toArray();
  }
}

export class LemmaSearch extends MultiSearch {
  expandToVerse = false;
  test = (entry: LemmaEntry) => {
    return this.any
      ? this.terms.some((t) => t.test(entry))
      : this.terms.every((t) => t.test(entry));
  };
}

export class AndSearch extends MultiSearch {
  test = (entry: LemmaEntry) => {
    return this.any
      ? this.terms.some((t) => t.test(entry))
      : this.terms.every((t) => t.test(entry));
  };

  filter = (entry: LemmaEntry[]) => {
    const results: Set<LemmaEntry> = new Set();

    for (const term of this.terms) {
      var match = term.filter(entry);
      if (!match.length && !this.any) return [];

      match.forEach((m) => results.add(m));
    }

    return [...results];
  };

  consumeFragment(fragment: string[]) {
    if (this.any || this.terms.length == 1) {
      for (const term of this.terms) {
        const result = term.consumeFragment(fragment);
        if (result) {
          return result;
        }
      }
    }

    return false;
  }
  getFragment(entry: LemmaEntry) {
    for (const term of this.terms) {
      const result = term.getFragment(entry);
      if (result && this.filter([entry]).length) {
        return result;
      }
    }

    return false;
  }
}

export class PhraseSearch extends MultiSearch {
  test = (entry: LemmaEntry) => {
    return this.terms.length == 1 ? this.terms[0].test(entry) : false;
  };

  filter = (entries: LemmaEntry[], noSeek: boolean = false) => {
    let entryIndex = 0;
    let termIndex = 0;
    let resetPoint = 0;
    let results: LemmaEntry[] = [];
    let fragment: string[] | null = null;

    while (entryIndex < entries.length && termIndex < this.terms.length) {
      const entry = entries[entryIndex];
      const term = this.terms[termIndex];

      if (!this.shouldSkipEntry(entry)) {
        const result = term.getFragment(entry);
        if (result) {
          if (termIndex == 0) {
            resetPoint = entryIndex + 1;
          }
          if (result instanceof Array) {
            fragment = result;
          }
          termIndex++;
          results.push(entry);

          while (fragment?.length && termIndex < this.terms.length) {
            const term = this.terms[termIndex];

            const result = term.consumeFragment(fragment);
            if (!result) {
              reset();
              break;
            }

            fragment = result;
            termIndex++;
          }
        } else if (noSeek) {
          return [];
        } else if (termIndex > 0) {
          reset();
        }
      }

      entryIndex++;
    }

    if (termIndex == this.terms.length) {
      return results;
    }

    return [];

    function reset() {
      termIndex = 0;
      entryIndex = resetPoint;
      results = [];
    }
  };

  shouldSkipEntry = (entry: LemmaEntry) => {
    // if there are no alpha numeric chars skip it
    // should skip whitespace and punctuation
    return !entry.translation.match(/[a-z]/i);
  };

  search(): SearchResult[] {
    let prepassResults = this.prepass();

    if (this.terms.length == 1) {
      return prepassResults
        .map((match) => ({
          id: match.id,
          match: [match],
          reference: match.reference,
          relevence: 1,
        }))
        .toArray();
    }

    const searchSets = this.expandToVerse
      ? prepassResults.map((a) => {
          const verse = this.concordance.getVerse(a.reference);
          const lemmaIndex = verse.indexOf(a);

          return verse.slice(lemmaIndex);
        })
      : prepassResults.map((a) => [a]);

    return searchSets
      .map((a) => this.filter(a, true))
      .filter(any)
      .map((match) => ({
        id: (match as LemmaEntry[])[0].id,
        match: match as LemmaEntry[],
        reference: (match as LemmaEntry[])[0].reference,
        relevence: 1,
      }))
      .toArray();
  }
}

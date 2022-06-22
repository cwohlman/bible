import { expect } from "chai";
import {
  AndSearch,
  Concordance,
  LemmaSearch,
  MorphSearch,
  NotSearch,
  PhraseSearch,
  ReferenceSearch,
  Search,
  StrongsSearch,
  WordSearch,
} from "./Concordance";
import { genesis11 } from "./test-data";

function test(
  name: string,
  fn: Function
): { name: string; execute: () => Error | true } {
  return {
    name,
    execute: () => {
      try {
        fn();
        return true;
      } catch (error) {
        console.error(error);
        console.error(error.stack);
        return error;
      }
    },
  };
}

const index = new Concordance(genesis11);

export const tests = [
  test("Concordance - Word search", () => {
    expect(new WordSearch("beginning", index).search()[0].reference).to.equal(
      "Gen.1.1"
    );
  }),
  test("Concordance - Lemma search", () => {
    expect(
      new LemmaSearch(
        [new WordSearch("god", index), new StrongsSearch("H430", index)],
        false,
        index
      ).search()[0].reference
    ).to.equal("Gen.1.1");
  }),
  test("Concordance - And search", () => {
    expect(
      new AndSearch(
        [new WordSearch("beginning", index), new WordSearch("god", index)],
        false,
        index
      ).search()[0].reference
    ).to.equal("Gen.1.1");
    expect(
      new AndSearch(
        [new WordSearch("beginning", index), new WordSearch("adam", index)],
        false,
        index
      ).search()
    ).to.be.empty;
    expect(
      new AndSearch(
        [new WordSearch("beginning", index), new WordSearch("adam", index)],
        true,
        index
      ).search()
    ).to.not.be.empty;
  }),
  test("Concordance - Not search", () => {
    expect(
      new AndSearch(
        [
          new NotSearch(new WordSearch("beginning", index), index),
          new WordSearch("god", index),
        ],
        false,
        index
      ).search()[0].reference
    ).to.not.equal("Gen.1.1");
  }),
  test("Concordance - Phrase search", () => {
    expect(
      new PhraseSearch(
        [
          new WordSearch("in", index),
          new WordSearch("the", index),
          new WordSearch("beginning", index),
          new WordSearch("god", index),
        ],
        false,
        index
      ).search()
    ).to.not.be.empty;
    expect(
      new PhraseSearch(
        [
          new WordSearch("in", index),
          new WordSearch("the", index),
          new WordSearch("god", index),
          new WordSearch("beginning", index),
        ],
        false,
        index
      ).search()
    ).to.be.empty;
  }),
  test("Concordance - Phrase search with strongs and morph", () => {
    expect(
      new PhraseSearch(
        [
          new WordSearch("in", index),
          new WordSearch("the", index),
          new WordSearch("beginning", index),
          new StrongsSearch("H430", index),
          new MorphSearch("TH8804", index),
        ],
        false,
        index
      ).search()
    ).to.not.be.empty;
    expect(
      new PhraseSearch(
        [
          new WordSearch("beginning", index),
          new StrongsSearch("H430", index),
          new MorphSearch("TH8804", index),
        ],
        false,
        index
      ).search()
    ).to.not.be.empty;
    expect(
      new PhraseSearch(
        [
          new WordSearch("in", index),
          new WordSearch("the", index),
          new StrongsSearch("H430", index),
          new MorphSearch("TH8804", index),
        ],
        false,
        index
      ).search()
    ).to.be.empty;
  }),
  test("Concordance - Complex search", () => {
    expect(
      new PhraseSearch(
        [
          new WordSearch("and", index),
          new WordSearch("god", index),
          new AndSearch(
            [
              new WordSearch("made", index),
              new WordSearch("said", index),
              new WordSearch("saw", index),
            ],
            true,
            index
          ),
        ],
        false,
        index
      ).search()
    ).to.have.length(20);
  }),
  test("Concordance - Complex search with verse reference", () => {
    const results = new AndSearch(
      [
        new ReferenceSearch("Gen.1.31", index),
        new PhraseSearch(
          [
            new WordSearch("and", index),
            new WordSearch("god", index),
            new AndSearch(
              [
                new WordSearch("made", index),
                new WordSearch("said", index),
                new WordSearch("saw", index),
              ],
              true,
              index
            ),
          ],
          false,
          index
        ),
      ],
      false,
      index
    ).search();
    expect(
      results[0].reference
    ).to.equal("Gen.1.31");
    expect(results).to.have.length(1);
  }),
  test("Concordance - parsed Complex search", () => {
    const search = Search.parse('"[and H430] any:(said made saw)"', index);
    const results = search.search();

    expect(results).to.have.length(20);
  }),
  test("Concordance - parsed Complex search with reference", () => {
    const search = Search.parse('Gen.1.31 "[and H430] any:(said made saw)"', index);
    const results = search.search();

    expect(results).to.have.length(1);
  }),
];

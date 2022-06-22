import { Menu, RadioGroup, Transition } from "@headlessui/react";
import {
  SortAscendingIcon,
  ArrowsExpandIcon,
  BookOpenIcon,
  ChevronDownIcon,
  DocumentDownloadIcon,
  SearchIcon,
  LinkIcon,
  XIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/outline";
import * as React from "react";
import { Fragment } from "react";
import { classNames } from "./classNames";
import {
  Concordance,
  LemmaEntry,
  SearchError,
  SearchResult,
  SearchResults,
} from "./Concordance";
import { colorWheel } from "./colors";

export const strongsColorWheel = colorWheel();

export type SearchType = "lemma" | "words" | "phrase";
export type GroupByType =
  | "none"
  | "testament"
  | "book"
  | "chapter"
  | "verse"
  // | "lemma"
  | "translation"
  | "strongs"
  | "morph";
export type SortByType = "bible" | "alphabetical";
export type OutputType =
  | "visible"
  | "testament"
  | "book"
  | "chapter"
  | "verse"
  | "KJV"
  // | "lemma"
  | "strongs"
  | "morph";
export type FormatType = "csv" | "json" | "list" | "pretty";
export type ContextType =
  | "lemma"
  | "5 words"
  | "1 verse"
  | "3 verses"
  | "5 verses";
export type VisibleType = "reference" | "lemma" | "KJV" | "strongs" | "morph";

export const searchTypeOptions = ["reference", "lemma", "words", "phrase"];
export const groupByOptions = [
  "none",
  "testament",
  "book",
  "chapter",
  "verse",
  // "lemma",
  "translation",
  "strongs",
  "morph",
];
export const sortByOptions = ["bible", "alphabetical"];
export const outputOptions = [
  "visible",
  "testament",
  "book",
  "chapter",
  "verse",
  "KJV",
  // "lemma",
  "strongs",
  "morph",
];
export const formatOptions = ["csv", "json", "list", "pretty"];
export const contextOptions = ["lemma", "5 words", "1 verse", "3 verses"];

export type StudyParams = {
  id: string;
  searchTerm: string;
  searchType: SearchType;
  groupBy: GroupByType;
  sortBy: SortByType;
  sortDirection: "asc" | "desc";
  collapseAll: boolean;
  collapsedGroups: string[];
  visible: {
    [k in VisibleType]: boolean;
  };
  interlinear: boolean;
  output: OutputType;
  context: ContextType;
  outputFormat: FormatType;
  hide: boolean;
};

export default function Study({
  study,
  update,
  close,
  concordance,
}: {
  study: StudyParams;
  update: (modifier: (draft: StudyParams) => void) => void;
  close: () => void;
  concordance?: Concordance;
}) {
  // TODO: move results here instead of passing them in
  const { searchTerm, hide: hidden } = study;

  const [searchResults, setSearchResults] = React.useState<
    SearchResults | SearchError
  >({ message: "Loading..." } as SearchError);

  React.useEffect(() => {
    if (!concordance) {
      setSearchResults({ message: "Loading " } as SearchError);
      return;
    }
    if (!searchTerm) {
      setSearchResults({
        message: "Please type your search above",
      } as SearchError);
      return;
    }

    try {
      setSearchResults(concordance.search(searchTerm));
    } catch (error) {
      console.log(error.stack);
      setSearchResults({ message: "Uncaught: " + error.stack } as SearchError);
    }
  }, [searchTerm, concordance]);

  const results =
    "message" in searchResults ? searchResults.message : searchResults.results;
  const timing = "message" in searchResults ? null : searchResults;

  const debounceTimeout = React.useRef<number>();

  const hide = () =>
    update((draft) => {
      draft.hide = !draft.hide;
    });

  const truncateLength = study.interlinear ? 1000 : 3000;
  const displayResults = React.useMemo(
    () =>
      typeof results == "string" ? (
        <p className="text-lg italic text-center p-5 text-gray-800">
          {results}
        </p>
      ) : "search" in searchResults && searchResults.search != searchTerm ? (
        <p className="text-lg italic text-center p-5 text-gray-800">
          Loading...
        </p>
      ) : (
        results.slice(0, truncateLength).map((r, i) => {
          return (
            <Result
              key={i}
              result={r}
              concordance={concordance as Concordance}
              interlinear={study.interlinear}
              visible={study.visible}
            />
          );
          // return <div key={i}>{r.verse}</div>
        })
      ),
    [searchTerm, searchResults, results, study.interlinear, study.visible]
  );

  const [renderTime, setRenderTime] = React.useState(() => Date.now());
  React.useEffect(() => {
    setRenderTime(Date.now());
  }, [results]);

  return (
    <div
      style={{ maxHeight: "calc(100vh - 2.5rem)" }}
      className={classNames(
        "flex flex-col overflow-hidden lg:w-1c lg:mx-5 lg:mt-5 lg:mb-0 mb-5 lg:rounded-lg shadow-lg lg:shrink-0 bg-slate-100 border border-gray-200",
        !hidden && "h-full"
      )}
    >
      <div className="border-b border-gray-200 p-1">
        <div className="flex items-center">
          <div className="grow">
            <label htmlFor="searchTerm" className="sr-only">
              Search
            </label>
            <form
              className="relative rounded-md shadow-sm"
              onSubmit={(e) => {
                e.preventDefault();
                if (debounceTimeout.current) {
                  clearTimeout(debounceTimeout.current);
                }
                const data = new FormData(e.currentTarget);
                update((study) => {
                  study.searchTerm = data.get("searchTerm")?.toString() || "";
                  return study;
                });
              }}
            >
              <button className="absolute inset-y-px left-px px-3 flex focus:border-2 focus:border-indigo-500 focus:z-10 hover:bg-blue-100 hover:border-blue-200 hover:z-1 border-r border-gray-200 rounded-l-md items-center pointer-events text-gray-700">
                <BookOpenIcon className="w-5 h-5" />
              </button>
              <input
                type="search"
                name="searchTerm"
                id="searchTerm"
                defaultValue={searchTerm}
                onChange={(e) => {
                  if (debounceTimeout.current) {
                    clearTimeout(debounceTimeout.current);
                  }
                  const target = e.target;
                  debounceTimeout.current = setTimeout(() => {
                    update((study) => {
                      study.searchTerm = target.value;
                      return study;
                    });
                  }, 1000) as any;
                }}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full h-10 pl-14 pr-32 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search the bible"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <div className="text-gray-500 text-xs italic mr-3">
                  {results instanceof Array ? (
                    <span
                      className={
                        results.length > 1200 ? "text-red-800 bold" : ""
                      }
                    >{`${results.length.toLocaleString("en-us", {
                      useGrouping: true,
                    })} results`}</span>
                  ) : null}
                  {timing ? (
                    <span
                      className={renderTime - timing.startTime > 100 ? "text-red-800 bold" : ""}
                    >{` in ${renderTime - timing.startTime}ms`}</span>
                  ) : null}
                </div>
                <label htmlFor="searchType" className="sr-only">
                  Search For
                </label>
                <select
                  id="searchType"
                  name="searchType"
                  className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-800 text-sm rounded-md capitalize"
                  value={study.searchType}
                  onChange={(e) => {
                    update((draft) => {
                      draft.searchType = e.currentTarget.value as SearchType;
                    });
                  }}
                >
                  {searchTypeOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            </form>
          </div>
          {/* <div>
          Put a plus dropdown here with:
          Search Within
          Compare
          Combine
            <input type="checkbox" className="mx-2" />
          </div> */}
        </div>
        <div className="py-1 flex gap-2 flex-wrap justify-between">
          <div className="flex items-baseline">
            <label
              htmlFor="groupBy"
              className="block ml-1 text-xs font-medium text-gray-700"
            >
              Group by
            </label>
            <select
              id="groupBy"
              name="groupBy"
              className="block ml-1 pl-3 pr-10 py-1 capitalize border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs rounded-md"
              value={study.groupBy}
            >
              {groupByOptions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <button
              type="button"
              className="inline-block ml-1 p-1 self-start border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowsExpandIcon className="w-4 h-4" />
            </button>
          </div>
          {/* <div>

          <button
              type="button"
              className="inline-block ml-1 p-1 self-start border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <BookOpenIcon className="w-4 h-4" />
            </button>
          </div> */}
          <div className="flex items-baseline">
            <label
              htmlFor="sortBy"
              className="block text-xs ml-1 font-medium text-gray-700"
            >
              Sort By
            </label>
            <select
              id="sortBy"
              name="sortBy"
              className="block ml-1 pl-3 pr-10 py-1 capitalize border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs rounded-md"
              value={study.sortBy}
            >
              {sortByOptions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <button
              type="button"
              className="inline-block ml-1 p-1 self-start border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <SortAscendingIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium  ml-1 text-gray-700">
              Show
            </span>

            {/* <button
              type="button"
              className="inline-block ml-1 p-1 border border-gray-300 text-xs rounded shadow-sm text-indigo-900 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Lemma
            </button> */}
            <button
              type="button"
              className="inline-block ml-1 p-1 border border-gray-300 text-xs rounded shadow-sm bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              KJV
            </button>
            <button
              type="button"
              className="inline-block ml-1 p-1 border border-gray-300 text-xs rounded shadow-sm bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Strongs
            </button>
            <button
              type="button"
              className="inline-block ml-1 p-1 border border-gray-300 text-xs rounded shadow-sm bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Morph
            </button>
            <button
              type="button"
              className={`inline-block ml-1 p-1 border border-gray-300 text-xs rounded shadow-sm ${
                study.interlinear
                  ? "font-bold bg-blue-700 hover:bg-blue-900 text-white"
                  : "bg-white hover:bg-blue-100"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={(e) => {
                update((draft) => {
                  draft.interlinear = !draft.interlinear;
                });
              }}
            >
              Interlinear
            </button>
          </div>
          <div className="flex items-baseline">
            <label
              htmlFor="context"
              className="block ml-1 text-xs font-medium text-gray-700"
            >
              Context
            </label>
            <select
              id="context"
              name="context"
              className="block ml-1 pl-3 pr-10 py-1 capitalize  border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs rounded-md"
              value={study.context}
            >
              {contextOptions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grow overflow-y-auto">
        {hidden ? (
          <p className="text-lg italic text-center p-5 text-gray-800">
            Minimized
          </p>
        ) : (
          displayResults
        )}
        {results.length > truncateLength ? (
          <p className="text-lg italic text-center p-5 text-gray-800">
            {results.length} results found. Only the first {truncateLength} results are
            shown.
          </p>
        ) : null}
        {results.length < 1 ? (
          <p className="text-lg italic text-center p-5 text-gray-800">
            No results found.
          </p>
        ) : null}
        {timing ? (
          <div className="text-xs italic text-center p-2 text-gray-700">
            <p>Search time {timing.endTime - timing.startTime}ms</p>
            <p>Render time {renderTime - timing.endTime}ms</p>
          </div>
        ) : null}
      </div>
      <div className="border-t border-gray-200">
        <div className="p-1 flex flex-wrap gap-2 justify-between">
          <div className="flex items-baseline">
            <label
              htmlFor="output"
              className="block text-xs font-medium text-gray-700"
            >
              Output
            </label>
            <select
              id="output"
              name="output"
              className="block ml-1 pl-3 pr-10 py-1 capitalize  border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs rounded-md"
              value={study.output}
            >
              {outputOptions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <button
              type="button"
              className="inline-flex ml-1 p-1 self-start border border-gray-300 text-xs font-medium rounded  text-indigo-900 bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Link
              <LinkIcon className="w-4 h-4 inline" />
            </button>
          </div>
          <div className="flex items-baseline">
            <label
              htmlFor="format"
              className="block text-xs font-medium text-gray-700"
            >
              Format
            </label>
            <select
              id="format"
              name="format"
              className="block ml-1 pl-3 pr-10 py-1 capitalize  border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs rounded-md"
              value={study.outputFormat}
            >
              {formatOptions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <button
              type="button"
              className="inline-flex ml-1 p-1 self-start border border-gray-300 text-xs font-medium rounded  text-indigo-900 bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Export
              <DocumentDownloadIcon className="w-4 h-4 inline" />
            </button>
          </div>
          <div>
            <button
              type="button"
              className={classNames(
                hidden ? "bg-green-100" : "bg-yellow-100",
                "inline-flex ml-1 p-1 self-start border border-gray-300 text-xs font-medium rounded  text-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              )}
              onClick={() => hide()}
            >
              {hidden ? (
                <PlusIcon className="w-4 h-4 inline" />
              ) : (
                <MinusIcon className="w-4 h-4 inline" />
              )}
            </button>
            <button
              type="button"
              className="inline-flex ml-1 p-1 self-start border border-gray-300 text-xs font-medium rounded  text-indigo-900 bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => close()}
            >
              <XIcon className="w-4 h-4 inline" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Result({
  result,
  visible,
  interlinear,
  concordance,
}: {
  result: SearchResult;
  visible: {
    [k in VisibleType]: boolean;
  };
  interlinear: boolean;
  concordance: Concordance;
}) {
  const context = React.useMemo(
    () => {
      let firstId = result.match[0].id;
      let lastId = result.match[result.match.length - 1].id;

      if (lastId < firstId)
        [firstId, lastId] = [lastId, firstId];

      if (lastId - firstId <= 2)
        // returns up to 7 lemmas
        return concordance?.getLemmasById(firstId - 2, lastId + 2)
      
      // returns only matching lemas and what's in between them
      return concordance?.getLemmasById(firstId, lastId)
    },
    [result.id - 2, result.id + 2]
  );
  return (
    <div className="even:bg-gray-50 odd:bg-gray-100 pb-3">
      <div className="">
        <div className="relative flex items-start p-1">
          <div className="flex items-center h-5">
            <input
              id={"comments-" + result.id}
              name={"comments-" + result.id}
              type="checkbox"
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor={"comments-" + result.id}
              className="font-serif font-medium text-gray-900"
            >
              {result.reference}
            </label>
          </div>
        </div>
      </div>
      {interlinear ? (
        <div className="flex overflow-x-auto justify-items-stretch">
          {context.map((lemma, i) => (
            <Lemma
              key={i}
              lemma={lemma}
              highlight={!!result.match.find((a) => a.id == lemma.id)}
              className=""
            />
          ))}
        </div>
      ) : (
        <div className="px-3 text-center">
          {context.map((lemma, i) => (
            <span
              className={
                !!result.match.find((a) => a.id == lemma.id) ? "font-bold" : "italic"
              }
            >
              {lemma.translation}
              {lemma.spaceAfter ? " " : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
export function Lemma({
  lemma,
  highlight,
  className,
}: {
  lemma: LemmaEntry;
  highlight: boolean;
  className: string;
}) {
  return (
    <div
      className={classNames(
        className,
        "text-center first:grow first:text-right last:grow last:text-left px-1",
        "",
        highlight && "grow"
      )}
    >
      <div
        className={classNames(
          "whitespace-nowrap text-black",
          highlight && "font-bold"
        )}
      >
        {lemma.translation || <>&nbsp;</>}
      </div>
      <div className="whitespace-nowrap italic text-gray-700 text-sm">
        {!lemma.morph.length && <>&nbsp;</>}
        {lemma.morph.map((morph) => (
          <span className="ml-1" key={morph}>
            {morph.replace("robinson:", "").replace("strongMorph:", "")}
          </span>
        ))}
      </div>
      <div className="whitespace-nowrap text-sm">
        {!lemma.lemma.length && <>&nbsp;</>}
        {lemma.lemma.map((lemma, i) => (
          <span
            className="ml-1"
            key={i}
            style={{ color: strongsColorWheel(lemma) }}
          >
            {lemma.replace("strong:", "")}
          </span>
        ))}
      </div>
      {/* TODO: the actual greek word? */}
    </div>
  );
}

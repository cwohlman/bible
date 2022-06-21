import { Menu, RadioGroup, Transition } from "@headlessui/react";
import {
  SortAscendingIcon,
  ArrowsExpandIcon,
  BookOpenIcon,
  ChevronDownIcon,
  DocumentDownloadIcon,
  SearchIcon,
} from "@heroicons/react/outline";
import * as React from "react";
import { Fragment } from "react";
import { classNames } from "./classNames";
import { Concordance, LemmaEntry } from "./Concordance";
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
  | "7 words"
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
export const contextOptions = ["lemma", "7 words", "1 verse", "3 verses"];
export default function Study({
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType,
  groupBy,
  setGroupBy,
  hide,
  concordance,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  groupBy: GroupByType;
  setGroupBy: (type: GroupByType) => void;
  visible: { [k in VisibleType]: boolean };
  setVisible: (visible: { [k in VisibleType]: boolean }) => void;
  output: OutputType;
  setOutput: (type: OutputType) => void;
  context: ContextType;
  setContext: (context: ContextType) => void;
  outputFormat: FormatType;
  setOutputFormat: (format: FormatType) => void;
  hide: boolean;
  concordance: Concordance;
}) {
  // TODO: move results here instead of passing them in

  const results = React.useMemo(() => {
    if (!concordance) {
      return "Loading";
    }
    if (!searchTerm) {
      return "Please type your search above";
    }

    if (searchTerm.match(/(G|H)\d+/i)) {
      return concordance.searchByLemma("strong:" + searchTerm);
    }

    if (searchTerm.match(/strong:/i)) {
      return concordance.searchByLemma(searchTerm);
    }

    if (searchTerm.match(/strongMorph\:|robinson\:/i)) {
      return concordance.searchByMorph(searchTerm);
    }

    if (searchTerm.length < 3) {
      return "Very short terms do not work well. Please use a longer term.";
    }

    return concordance.searchByText(searchTerm);
  }, [searchTerm, concordance]);

  return (
    <div style={{maxHeight: "calc(100vh - 2.5rem)"}} className="flex flex-col overflow-hidden lg:w-1c lg:mx-5 lg:mt-5 lg:mb-0 mb-5 lg:rounded-lg shadow-lg lg:shrink-0 bg-slate-100 border border-gray-200">
      <div className="border-b border-gray-200 p-1">
        <div className="flex items-center">
          <div className="grow">
            <label htmlFor="searchTerm" className="sr-only">
              Serch
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-700">
                <BookOpenIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="searchTerm"
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full h-10 pl-10 pr-16 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search the bible"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <label htmlFor="searchType" className="sr-only">
                  Search For
                </label>
                <select
                  id="searchType"
                  name="searchType"
                  className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 text-sm rounded-md capitalize"
                  defaultValue="lemma"
                >
                  {searchTypeOptions.map((option) => (
                    <option>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* <div>
          Put a plus dropdown here with:
          Search Within
          Compare
          Combine
            <input type="checkbox" className="mx-2" />
          </div> */}
        </div>
        <div className="py-1 flex gap-2 justify-between">
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
              className="block ml-1 pl-3 pr-10 py-1 capitalize text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs rounded-md"
              defaultValue="book"
            >
              {groupByOptions.map((value) => (
                <option>{value}</option>
              ))}
            </select>
            <button
              type="button"
              className="inline-block ml-1 p-1 self-start border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowsExpandIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline">
            <label
              htmlFor="sortBy"
              className="block text-xs font-medium text-gray-700"
            >
              Sort By
            </label>
            <select
              id="sortBy"
              name="sortBy"
              className="block ml-1 pl-3 pr-10 py-1 capitalize text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs rounded-md"
              defaultValue="book"
            >
              {sortByOptions.map((value) => (
                <option>{value}</option>
              ))}
            </select>
            <button
              type="button"
              className="inline-block ml-1 p-1 self-start border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <SortAscendingIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grow overflow-y-auto">
        {hide ? null : typeof results == "string" ? (
          <p className="text-lg italic text-center p-5 text-gray-800">
            {results}
          </p>
        ) 
        : results.length > 300 ? (
          <p className="text-lg italic text-center p-5 text-gray-800">
            {results.length} results found. Please narrow your search to fewer than 300 results.
          </p>
        ) 
        : (
          results.map((r, i) => {
            return <Result key={i} result={r} concordance={concordance} />;
            // return <div key={i}>{r.verse}</div>
          })
        )}
      </div>
      <div className="border-t border-gray-200">
        <div className="flex justify-between p-1 pb-0">
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-700">Show</span>

            {/* <button
              type="button"
              className="inline-block ml-1 p-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Lemma
            </button> */}
            <button
              type="button"
              className="inline-block ml-1 p-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              KJV
            </button>
            <button
              type="button"
              className="inline-block ml-1 p-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Strongs
            </button>
            <button
              type="button"
              className="inline-block ml-1 p-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Morph
            </button>
            <button
              type="button"
              className="inline-block ml-1 p-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
              className="block ml-1 pl-3 pr-10 py-1 capitalize text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs rounded-md"
              defaultValue="book"
            >
              {contextOptions.map((value) => (
                <option>{value}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-1 flex gap-2 justify-between">
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
              className="block ml-1 pl-3 pr-10 py-1 capitalize text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs rounded-md"
              defaultValue="KJV"
            >
              {outputOptions.map((value) => (
                <option>{value}</option>
              ))}
            </select>
            {/* <button
              type="button"
              className="inline-block ml-1 p-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-yellow-100 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Search
            </button> */}
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
              className="block ml-1 pl-3 pr-10 py-1 capitalize text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs rounded-md"
              defaultValue="KJV"
            >
              {formatOptions.map((value) => (
                <option>{value}</option>
              ))}
            </select>
            <button
              type="button"
              className="inline-flex ml-1 p-1 self-start border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-green-100 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Export
              <DocumentDownloadIcon className="w-4 h-4 inline" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Result({
  result,
  concordance,
}: {
  result: LemmaEntry;
  concordance: Concordance;
}) {
  const context = React.useMemo(
    () => concordance?.getVersesById(result.id - 2, result.id + 2),
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
              {result.verse}
            </label>
          </div>
        </div>
      </div>
      <div className="flex overflow-x-auto justify-items-stretch">
        {context.map((lemma, i) => (
          <Lemma key={i} lemma={lemma} highlight={result == lemma} className="" />
        ))}
      </div>
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
        {lemma.text || <>&nbsp;</>}
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
        {lemma.lemma.map((lemma) => (
          <span
            className="ml-1"
            key={lemma}
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

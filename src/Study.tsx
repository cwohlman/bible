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
import { LemmaEntry } from "./Concordance";

export type SearchType = "lemma" | "words" | "phrase";
export type GroupByType =
  | "none"
  | "testament"
  | "book"
  | "chapter"
  | "verse"
  | "lemma"
  | "translation"
  | "strongs";

export const searchTypeOptions = ["reference", "lemma", "words", "phrase"];
export const groupByOptions = [
  "none",
  "testament",
  "book",
  "chapter",
  "verse",
  "lemma",
  "translation",
  "strongs",
];
export const sortByOptions = ["bible", "alphabetical"];
export const outputOptions = [
  "visible",
  "testament",
  "book",
  "chapter",
  "verse",
  "KJV",
  "lemma",
  "strongs",
];
export const formatOptions = [
  "csv",
  "json",
  "list",
  "pretty",
];
export const contextOptions = ["lemma", "7 words", "1 verse", "3 verses"];
export default function Study({
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType,
  groupBy,
  setGroupBy,
  results,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  groupBy: GroupByType;
  setGroupBy: (type: GroupByType) => void;
  results: LemmaEntry[] | string;
}) {
  return (
    <div className="flex flex-col overflow-hidden lg:w-1c lg:my-5 lg:mr-0 lg:m-5 mb-5 max-h-screen lg:rounded-lg shadow-lg lg:shrink-0 lg:max-h-full bg-slate-100 border border-gray-200">
      <div className="border-b border-gray-200 p-1">
        <div>
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
                {searchTypeOptions.map(option => <option>{option}</option>)}
              </select>
            </div>
          </div>
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

      <div className="grow p-5 overflow-y-auto">
        {typeof results == "string"
          ? results
          : results.map((r, i) => {
              return <div key={i}>{r.lemma}</div>;
            })}
      </div>
      <div className="border-t border-gray-200">
        <div className="flex justify-between p-1 pb-0">
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-700">Show</span>

            <button
              type="button"
              className="inline-block ml-1 p-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-indigo-900 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Lemma
            </button>
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

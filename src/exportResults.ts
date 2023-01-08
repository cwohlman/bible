import {
  LemmaEntry,
  SearchResult,

} from "./Concordance";
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
export type FormatType = "csv" | "json" | "list" | "search" | "pretty";
export const formatOptions = ["csv", "json", "list", "search", "pretty"];

export const exportResults = (results: SearchResult[], outputType: OutputType, formatType: FormatType) => {
	const data = getData(results, outputType);

	const formattted = formatData(data, formatType);

	return formattted;
}

function getData(results: SearchResult[], outputType: OutputType) {
	switch (outputType) {
		case "strongs":
			return results.map(result => result.match.map(match => match.lemma).flat()).flat();
		default:
			throw new Error("Not supported: " + outputType)
	}
}

function formatData(results: ({ [key: "reference" | "lemma" | "KJV" | "strongs" | "morph"]: string } | string)[], formatType: FormatType) {
	switch (formatType) {
		case "list":
			return results.map(r => {
				if (typeof r == "string") {
					return r;
				}


				const result = [];


				Object.keys(r).forEach(key => {
					result.push(`${key}: ${r[key]}`)
				})

				return result.join(", ")
			}).join("\n")
		default:
			throw new Error("Not supported: " + formatType)
	}
}
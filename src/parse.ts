import { parse as domParser } from "node-html-parser";

export function parse(xml: string) {
  const xmlDoc = domParser(xml);

  return xmlDoc;
}

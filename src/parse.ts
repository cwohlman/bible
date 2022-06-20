export function parse(xml: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");

  return xmlDoc;
}

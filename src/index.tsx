//import fs from 'fs';
import * as React from "react";
import * as ReactDom from "react-dom";
import { Concordance } from "./Concordance";

const App = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [concordance, setConcordance] = React.useState<Concordance>(null);
  const [sort, setSort] = React.useState<{
    field: "bible" | "text";
    order: "asc" | "desc";
  }>({ field: "bible", order: "asc" });

  React.useEffect(() => {
    import('./data')
      .then((response) => response.bible)
      .then((text) => {
        setConcordance(new Concordance(text));
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

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

  const debounceTimeout = React.useRef(null);

  return (
    <div>
      <div className="jumbotron text-center">
        <form
          style={{ maxWidth: "420px", margin: "0 auto" }}
          onSubmit={(e) => {
            analyticsEvent("search_submit");
            e.preventDefault();
          }}
        >
          <input
            className="form-control"
            type="text"
            defaultValue={searchTerm}
            placeholder="Search term"
            onChange={(e) => {
              if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
              }
              const target = e.target;
              debounceTimeout.current = setTimeout(() => {
                analyticsEvent("search_timeout");
                setSearchTerm(target.value);
              }, 300);
            }}
          />
          <p>
            You can search for a word or phrase, Strong's Number (beginning with
            G or H), or Morph code (beginning with strongMorph: or robinson:)
          </p>
        </form>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {typeof results === "string" ? (
          results
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Text</th>
                <th>Lemma</th>
                <th>Morph</th>
                <th>Verse</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => {
                return (
                  <tr>
                    <td>{result.text}</td>
                    <td>{result.lemma.join(" ")}</td>
                    <td>{result.morph.join(" ")}</td>
                    <td>{result.verse}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

ReactDom.render(<App />, document.getElementById("react-root"));

function analyticsEvent(eventName) {
  // @ts-expect-error
  sa_event && sa_event(eventName);
}

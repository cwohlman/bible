//import fs from 'fs';
import * as React from "react";
import * as ReactDom from "react-dom";
import { Concordance } from "./Concordance";
import Layout from "./Layout";
import Study from "./Study";

const App = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [concordance, setConcordance] = React.useState<Concordance>();
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


  return (
    <Layout>
      <Study searchTerm={searchTerm} setSearchTerm={setSearchTerm} concordance={concordance} />
    </Layout>
  );
};

ReactDom.render(<App />, document.getElementById("react-root"));

function analyticsEvent(eventName) {
  // @ts-expect-error
  sa_event && sa_event(eventName);
}

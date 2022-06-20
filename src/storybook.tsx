//import fs from 'fs';
import * as React from "react";
import * as ReactDom from "react-dom";
import { Concordance } from "./Concordance";
import Layout from "./Layout";
import Study from "./Study";

const App = () => {
  const [story, setStory] = React.useState<string | number>(1);
  const Story = stories[story] || (() => <div>No Story</div>);

  return (
    <div onKeyDown={(e) => { setStory(e.key) }}>
      <Story/>
    </div>
  );
};

const OneStudy = () => {
  const [searchTerm, setSearchTerm] = React.useState("Jesus");
  const [concordance, setConcordance] = React.useState<Concordance>(null);


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

  return <Layout>
    <Study searchTerm={searchTerm} results={results} />
  </Layout>
}
const ThreeStudies = () => {
  const [searchTerm, setSearchTerm] = React.useState("Jesus");
  const [concordance, setConcordance] = React.useState<Concordance>(null);


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

  return <Layout>
    <Study searchTerm={searchTerm} results={results} />
    <Study searchTerm={searchTerm} results={results} />
    <Study searchTerm={searchTerm} results={results} />
  </Layout>
}

const stories = [OneStudy, ThreeStudies]

ReactDom.render(<App />, document.getElementById("react-root"));

function analyticsEvent(eventName) {
  // @ts-expect-error
  sa_event && sa_event(eventName);
}

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
    <div >
      <Story/>
    </div>
  );
};

const OneStudy = () => {
  const [searchTerm, setSearchTerm] = React.useState("Rechab");
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

  return <Layout>
    <Study searchTerm={searchTerm} setSearchTerm={setSearchTerm} concordance={concordance} />
  </Layout>
}
const ThreeStudies = () => {
  const [searchTerm, setSearchTerm] = React.useState("Rechab");
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


  return <Layout>
    <Study searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchType="lemma" concordance={concordance} />
    <Study searchTerm={"Crab"} setSearchTerm={setSearchTerm} searchType="lemma" concordance={concordance} />
    <Study searchTerm={"Jesus"} setSearchTerm={setSearchTerm} searchType="lemma" concordance={concordance} />
    <Study searchTerm={"Fish"} setSearchTerm={setSearchTerm} searchType="lemma" concordance={concordance} />
  </Layout>
}

const stories = [OneStudy, ThreeStudies]

ReactDom.render(<App />, document.getElementById("react-root"));

function analyticsEvent(eventName) {
  // @ts-expect-error
  sa_event && sa_event(eventName);
}

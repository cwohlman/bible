//import fs from 'fs';
import * as React from "react";
import * as ReactDom from "react-dom";
import { Concordance } from "./Concordance";
import Layout from "./Layout";
import Study, { StudyParams } from "./Study";
import { useImmer } from "use-immer";

let nextId = 0;

const App = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [concordance, setConcordance] = React.useState<Concordance>();
  const [sort, setSort] = React.useState<{
    field: "bible" | "text";
    order: "asc" | "desc";
  }>({ field: "bible", order: "asc" });

  React.useEffect(() => {
    import("./data")
      .then((response) => response.bible)
      .then((text) => {
        setConcordance(new Concordance(text));
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const [studies, setStudies] = useImmer<StudyParams[]>([
    {
      id: nextId++ + "",
      searchTerm: "faithful",
      searchType: "lemma",
      visible: {
        reference: true,
        morph: true,
        strongs: true,
        lemma: true,
        KJV: true,
      },
      interlinear: true,
      groupBy: "book",
      collapsedGroups: [],
      output: "KJV",
      outputFormat: "list",
      context: "5 words",
      hide: false,
    },
  ]);

  return (
    <Layout>
      {studies.map((study) => (
        <Study
          study={study}
          update={(m) =>
            setStudies((all) => {
              m(all.find((a) => a.id == study.id) as StudyParams);
            })
          }
          concordance={concordance}
        />
      ))}

      <button
        onClick={() =>
          setStudies((draft) => {
            draft.push({
              id: nextId++ + "",
              searchTerm: "faithful",
              searchType: "lemma",
              visible: {
                reference: true,
                morph: true,
                strongs: true,
                lemma: true,
                KJV: true,
              },
              interlinear: true,
              groupBy: "book",
              collapsedGroups: [],
              output: "KJV",
              outputFormat: "list",
              context: "5 words",
              hide: false,
            });
          })
        }
      >
        New Study
      </button>
    </Layout>
  );
};

ReactDom.render(<App />, document.getElementById("react-root"));

function analyticsEvent(eventName) {
  // @ts-expect-error
  sa_event && sa_event(eventName);
}

//import fs from 'fs';
import * as React from "react";
import * as ReactDom from "react-dom";
import { Concordance } from "./Concordance";
import Layout from "./Layout";
import Study, { StudyParams } from "./Study";
import { useImmer } from "use-immer";
import { useEffect } from "react";
import getId from "./getId";

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

  const [studies, setStudies] = useImmer<StudyParams[]>(() => {
    try {
      const storedStudies = localStorage.getItem("studies");
      if (storedStudies) return JSON.parse(storedStudies);
    } catch (e) {}
    return [
      {
        id: getId(),
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
    ];
  });

  const studiesRef = React.useRef(studies);

  studiesRef.current = studies;

  useEffect(() => {
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const handleUnload = (e) => {
    localStorage.setItem("studies", JSON.stringify(studiesRef.current));
  };

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
          close={() => setStudies((all) => all.filter((a) => a.id != study.id))}
          concordance={concordance}
        />
      ))}

      <button
        onClick={() =>
          setStudies((draft) => {
            draft.push({
              id: getId(),
              searchTerm: "",
              searchType: "lemma",
              sortBy: "bible",
              sortDirection: "asc",
              visible: {
                reference: true,
                morph: true,
                strongs: true,
                lemma: true,
                KJV: true,
              },
              interlinear: true,
              groupBy: "book",
              collapseAll: false,
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

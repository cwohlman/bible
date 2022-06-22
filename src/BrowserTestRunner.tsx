import { tests } from './tests';
import * as React from "react";
import * as ReactDom from "react-dom";

const App = () => {
  const [results, setResults] = React.useState<{ name: string, result: null | true | Error }[]>(tests.map(a => ({ name: a.name, result: null })));

  React.useEffect(() => {
    setResults(tests.map(t => ({ name: t.name, result: t.execute() })))
  }, [])

  return (
    <div >
      {results.map((r, i) => <div className='flex' key={i}>
        <div className='m-5'>{r.name}</div>
        <div className={`m-5 ${r.result == true ? "text-green-800" : !r.result ? "text-yellow-800" : "text-red-800 font-bold whitespace-pre"}`}>{r.result ? (
          r.result == true ? "Pass" :
          r.result.stack
        ) : "Loading..."}</div>
      </div>)}
    </div>
  );
};


ReactDom.render(<App />, document.getElementById("react-root"));
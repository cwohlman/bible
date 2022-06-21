import * as React from "react";
import {InformationCircleIcon} from "@heroicons/react/outline";

export default ({ children }) => {
  const [showAbout, setShowAbout] = React.useState(false);

  return (
    <div className="lg:flex lg:w-screen lg:h-screen lg:overflow-y-hidden lg:overflow-x-auto bg-amber-50">
      <div className="p-5 lg:pr-0 flex lg:flex-col">
        <header className="lg:[writing-mode:vertical-lr] lg:[text-orientation:upright] uppercase font-bold text-xl grow"><a href="/">Bible Search</a></header>
        <a href="#" onClick={(e) => {e.preventDefault(); setShowAbout(!showAbout)}}>
          <InformationCircleIcon className="w-8 h-8" />
        </a>
      </div>
      {
        showAbout ? (
          <div className="flex flex-col overflow-hidden p-5 lg:w-1c lg:my-5 lg:m-5 mb-5 max-h-screen lg:rounded-lg shadow-lg lg:shrink-0 lg:max-h-full bg-slate-100 border border-gray-200">
            <h1>About Bible Search</h1>
            <p>Made by Ohlman IO LLC</p>
            <p>Copyright (c) 2022 Ohlman IO LLC</p>
          </div>
        ) : null
      }
      {/* <div className="flex-col flex-wrap h-full overflow-y-hidden"> */}
      {children}
      {/* </div> */}
    </div>
  );
};

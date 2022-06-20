import * as React from "react";
import {InformationCircleIcon} from "@heroicons/react/outline";

export default ({ children }) => {
  const [showAbout, setShowAbout] = React.useState(false);

  return (
    <div className="lg:flex lg:w-screen lg:h-screen lg:overflow-y-hidden lg:overflow-x-auto bg-amber-50">
      <div className="p-5 pr-0 flex flex-col">
        <header className="lg:[writing-mode:vertical-lr] lg:[text-orientation:upright] uppercase font-bold text-xl grow">Bible Search</header>
        <a onClick={(e) => {e.preventDefault(); setShowAbout(!showAbout)}}>
          <InformationCircleIcon className="w-8 h-8" />
        </a>
      </div>
      {
        showAbout ? (
          <div></div>


        ) : null
      }
      {children}
    </div>
  );
};

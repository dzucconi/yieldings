import React from "react";
import ReactDOM from "react-dom";
import parameters from "queryparams";
import { ambient } from "audiate";

import { App } from "./App";
import { Available } from "./components/Available";

import * as serviceWorker from "./serviceWorker";

import "./index.css";

const { autoPlay, index } = parameters({ autoPlay: null, index: false });

if (autoPlay) ambient();

ReactDOM.render(
  index ? <Available /> : <App autoPlay={autoPlay} />,
  document.getElementById("root")
);

serviceWorker.unregister(); // disabled for now

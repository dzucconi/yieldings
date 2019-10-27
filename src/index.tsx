import React from "react";
import ReactDOM from "react-dom";
import { ambient } from "audiate";

import { autoPlay, index } from "./config";
import { App } from "./App";
import { Available } from "./components/Available";

import * as serviceWorker from "./serviceWorker";

import "./index.css";

if (autoPlay) ambient();

ReactDOM.render(
  index ? <Available /> : <App autoPlay={autoPlay} />,
  document.getElementById("root")
);

serviceWorker.unregister(); // disabled for now

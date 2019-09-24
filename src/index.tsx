import React from "react";
import ReactDOM from "react-dom";
import parameters from "queryparams";

import App from "./App";
import * as serviceWorker from "./serviceWorker";

import "./index.css";

const { autoPlay } = parameters({ autoPlay: false });

ReactDOM.render(<App autoPlay={autoPlay} />, document.getElementById("root"));

serviceWorker.unregister(); // disabled for now

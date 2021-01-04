import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import { MatomoProvider, createInstance } from "@datapunt/matomo-tracker-react";

const instance = createInstance({
  urlBase: "https://envoylint.com",
  siteId: 1,
  trackerUrl: "https://ysww.dev/m.php",
  srcUrl: "https://ysww.dev/m.js",
  disabled: false,
  heartBeat: {
    active: true, // optional, default value: true
    seconds: 10, // optional, default value: 15
  },
  linkTracking: true, // optional, default value: true
  configurations: {
    // setSecureCookie: true,
    setRequestMethod: "POST",
  },
});

ReactDOM.render(
  <React.StrictMode>
    <MatomoProvider value={instance}>
      <App />
    </MatomoProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

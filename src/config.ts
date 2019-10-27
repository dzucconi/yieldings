import parameters from "queryparams";

import { Title } from "./data";

export const {
  autoPlay,
  index,
  pauseMin,
  pauseMax
}: {
  autoPlay: Title;
  index: boolean;
  pauseMin: number;
  pauseMax: number;
} = parameters({
  autoPlay: null,
  index: false,
  pauseMin: 15,
  pauseMax: 250
});

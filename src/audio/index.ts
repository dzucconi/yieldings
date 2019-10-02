import { Howl } from "howler";
// @ts-ignore
import type from "./type.mp3";
// @ts-ignore
import space from "./space.mp3";
// @ts-ignore
import backspace from "./backspace.mp3";

export const audio = {
  type: new Howl({ src: [type], autoplay: false }),
  space: new Howl({ src: [space], autoplay: false }),
  backspace: new Howl({ src: [backspace], autoplay: false })
};

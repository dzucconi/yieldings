import { Howl } from "howler";
// @ts-ignore
import type from "./type.mp3";
// @ts-ignore
import space from "./space.mp3";
// @ts-ignore
import backspace from "./backspace.mp3";

export const audio = {
  type: new Howl({ src: [type], autoplay: false, preload: true }),
  space: new Howl({ src: [space], autoplay: false, preload: true }),
  backspace: new Howl({ src: [backspace], autoplay: false, preload: true })
};

import { Howl } from "howler";

// @ts-ignore
import tock from "./tock.wav";

export const sounds = {
  tock: new Howl({
    src: [tock],
    autoplay: false
  })
};

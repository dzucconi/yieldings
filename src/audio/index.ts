import { Howl } from "howler";

// @ts-ignore
import tock from "./tock.mp3";

export const audio = {
  tock: new Howl({
    src: [tock],
    autoplay: false
  })
};

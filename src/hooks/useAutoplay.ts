import { useEffect, useState } from "react";
import { humanize, simulateTyping, simulateStrokeTiming } from "humanization";

import { Action } from "../App";
import { sample } from "../lib/sample";
import { SPELLINGS } from "../data";

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const useAutoplay = ({
  autoPlay,
  dispatch,
  onSelect
}: {
  autoPlay: boolean;
  dispatch: React.Dispatch<Action>;
  onSelect(): void;
}) => {
  const [input, updateInput] = useState(sample(SPELLINGS));

  useEffect(() => {
    if (autoPlay) {
      const { stream } = humanize(input);
      simulateTyping({
        stream,
        onStroke: ({ stroke, previousStroke }) => {
          return new Promise(async resolve => {
            dispatch({
              type: "APPEND",
              payload: { character: stroke.character }
            });

            await simulateStrokeTiming();

            // omitted character, re-append correct one
            if (stroke.character.length === 0) {
              dispatch({
                type: "APPEND",
                payload: { character: stroke.processedCharacter.source }
              });

              await simulateStrokeTiming();
            }

            // mistaken character, backspace then correct
            if (
              stroke.character !== stroke.processedCharacter.source &&
              stroke.character.length !== 0
            ) {
              dispatch({ type: "BACKSPACE" });
              await simulateStrokeTiming();

              dispatch({
                type: "APPEND",
                payload: { character: stroke.processedCharacter.source }
              });

              await simulateStrokeTiming({ pauseMax: 500 });
            }

            // repeated character, backspace
            if (
              stroke.index.join("") ===
              (previousStroke && previousStroke.index.join(""))
            ) {
              dispatch({ type: "BACKSPACE" });
              await simulateStrokeTiming();
            }

            resolve();
          });
        }
      })
        .then(async () => {
          await wait(5000);

          onSelect();

          await wait(1000);

          dispatch({ type: "UPDATE", payload: { value: "" } });
        })
        .then(async () => {
          await wait(2000);

          const nextInput = sample(SPELLINGS);

          dispatch({ type: "RESET" });

          updateInput(nextInput);
        });
    }
  }, [autoPlay, dispatch, input, onSelect]);
};

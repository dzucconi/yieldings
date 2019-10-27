import { useEffect, useReducer } from "react";
import { humanize, simulateTyping, simulateStrokeTiming } from "humanization";

import { Exercise } from "../data";
import { wait } from "../lib/wait";

const PAUSE_MIN = 15;
const PAUSE_MAX = 250;
const LONG_PAUSE_MAX = PAUSE_MAX * 2;

type Action = { type: "NEXT" };

interface State {
  cursor: number;
  input: string;
  exercises: string[];
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "NEXT": {
      const nextCursor = state.cursor + 1;
      return {
        ...state,
        cursor: nextCursor,
        input: state.exercises[nextCursor % state.exercises.length]
      };
    }
  }
};

export interface Props {
  exercise: Exercise;
  onSelect(): void;
  onAppend(character: string): void;
  onBackspace(): void;
  onReset(): void;
  onUpdate(value: string): void;
}

export const useAutoplay = ({
  exercise,
  onSelect,
  onAppend,
  onBackspace,
  onReset,
  onUpdate
}: Props) => {
  const [state, dispatch] = useReducer(reducer, {
    cursor: 0,
    input: exercise.exercises[0],
    exercises: exercise.exercises
  });

  useEffect(() => {
    document.title = exercise.title;
    return () => {
      document.title = "Yieldings";
    };
  }, [exercise.title]);

  useEffect(() => {
    const { stream } = humanize(state.input);

    simulateTyping({
      stream,
      onStroke: ({ stroke, previousStroke }) => {
        const prevCharacter = previousStroke && previousStroke.character;

        return new Promise(async resolve => {
          // append the character unless it's been omitted
          if (stroke.character.length !== 0) {
            onAppend(stroke.character);
            await simulateStrokeTiming({
              pauseMin: PAUSE_MIN,
              pauseMax: PAUSE_MAX,
              prevCharacter
            });
          }

          // omitted character, re-append correct one
          if (stroke.character.length === 0) {
            onAppend(stroke.processedCharacter.source);

            await simulateStrokeTiming({
              pauseMin: PAUSE_MIN,
              pauseMax: PAUSE_MAX,
              prevCharacter
            });
          }

          // mistaken character, backspace then correct
          if (
            stroke.character !== stroke.processedCharacter.source &&
            stroke.character.length !== 0
          ) {
            onBackspace();
            await simulateStrokeTiming({
              pauseMin: PAUSE_MIN,
              pauseMax: PAUSE_MAX,
              prevCharacter
            });

            onAppend(stroke.processedCharacter.source);

            await simulateStrokeTiming({
              pauseMin: PAUSE_MIN,
              pauseMax: LONG_PAUSE_MAX,
              prevCharacter
            });
          }

          // repeated character, backspace
          if (
            stroke.index.join("") ===
            (previousStroke && previousStroke.index.join(""))
          ) {
            onBackspace();
            await simulateStrokeTiming({
              pauseMin: PAUSE_MIN,
              pauseMax: PAUSE_MAX,
              prevCharacter
            });
          }

          resolve();
        });
      }
    })
      .then(async () => {
        await wait(LONG_PAUSE_MAX * 10);
        onSelect();
        await wait(LONG_PAUSE_MAX * 2);
        onUpdate("");
        return Promise.resolve();
      })
      .then(async () => {
        await wait(LONG_PAUSE_MAX * 4);
        onReset();
        dispatch({ type: "NEXT" });
      });
  }, [
    exercise,
    state.input,
    onAppend,
    onBackspace,
    onReset,
    onSelect,
    onUpdate
  ]);
};

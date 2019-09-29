import { useEffect, useReducer } from "react";
import { humanize, simulateTyping, simulateStrokeTiming } from "humanization";

import { Exercise } from "../data";

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

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
        return new Promise(async resolve => {
          onAppend(stroke.character);
          await simulateStrokeTiming();

          // omitted character, re-append correct one
          if (stroke.character.length === 0) {
            onAppend(stroke.processedCharacter.source);

            await simulateStrokeTiming();
          }

          // mistaken character, backspace then correct
          if (
            stroke.character !== stroke.processedCharacter.source &&
            stroke.character.length !== 0
          ) {
            onBackspace();
            await simulateStrokeTiming();

            onAppend(stroke.processedCharacter.source);

            await simulateStrokeTiming({ pauseMax: 500 });
          }

          // repeated character, backspace
          if (
            stroke.index.join("") ===
            (previousStroke && previousStroke.index.join(""))
          ) {
            onBackspace();
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
        onUpdate("");
        return Promise.resolve();
      })
      .then(async () => {
        await wait(2000);
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

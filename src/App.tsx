import React, { useReducer, useEffect } from "react";
import styled from "styled-components";
import { humanize, simulateTyping, simulateStrokeTiming } from "humanization";
import { diffChars } from "diff";

import { sample } from "./lib/sample";
import { SPELLINGS } from "./data";
import { Textarea } from "./components/Textarea";

const diffRemoved = ({
  prevValue,
  nextValue,
  prevRemoved
}: {
  prevValue: string;
  nextValue: string;
  prevRemoved: string;
}) =>
  diffChars(prevValue, nextValue).reduce((memo, change) => {
    if (change.removed) {
      return (memo += change.value
        .split("")
        .reverse()
        .join(""));
    }

    return memo;
  }, prevRemoved);

const Container = styled.div`
  display: flex;
  height: 100vh;

  @media (max-width: 800px) {
    flex-direction: column;
  }

  > * {
    flex: 1;
    background-color: transparent;
  }
`;

interface State {
  value: string;
  removed: string;
}

type Action =
  | { type: "UPDATE"; payload: { value: string } }
  | { type: "APPEND"; payload: { character: string } }
  | { type: "BACKSPACE" };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "UPDATE":
      return {
        ...state,
        removed: diffRemoved({
          prevValue: state.value,
          nextValue: action.payload.value,
          prevRemoved: state.removed
        }),
        value: action.payload.value
      };
    case "APPEND":
      const nextValue = state.value + action.payload.character;
      return {
        ...state,
        value: nextValue
      };
    case "BACKSPACE":
      return {
        ...state,
        value: state.value.substr(0, state.value.length - 1),
        removed: state.removed + state.value[state.value.length - 1]
      };
  }
};

interface Props {
  autoPlay?: boolean;
}

const App: React.FC<Props> = ({ autoPlay = true }) => {
  const [state, dispatch] = useReducer(reducer, {
    removed: "",
    value: ""
  });

  useEffect(() => {
    if (autoPlay) {
      simulateTyping({
        stream: humanize(sample(SPELLINGS)).stream,
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
      });
    }
  }, [autoPlay]);

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    dispatch({ type: "UPDATE", payload: { value: event.currentTarget.value } });
  };

  return (
    <Container>
      <Textarea
        value={state.value}
        autoFocus={state.value === ""}
        onInput={handleInput}
        placeholder="Type"
      />
      <Textarea readOnly value={state.removed} placeholder="Removals" />
    </Container>
  );
};

export default App;

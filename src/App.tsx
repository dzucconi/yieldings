import React, { useReducer, useEffect } from "react";
import styled from "styled-components";
import { humanize, simulateTyping, simulateStrokeTiming } from "humanization";
import { diffChars } from "diff";

import { Textarea } from "./components/Textarea";

const initialMessage = `
  He used an analog Oberheim 'Xpander' synth, hence the name of the track...
  it was built in the mid Eighties...
  which I have owned and has this characteristic lush sound...
  the synth itself plays a huge part in this track...
  Warm sounding (now impossible to find) CEM chips through the Xpanders huge modulation matrix with 19 or so filter types...!
  they say an instrument can repay itself...
  I wonder how much cash this track made him!
`;

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

  > * {
    flex: 1;
    background-color: transparent;
  }
`;

interface State {
  inputValue?: string;
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

const App: React.FC<Props> = ({ autoPlay = false }) => {
  const [state, dispatch] = useReducer(reducer, {
    inputValue: initialMessage,
    removed: "",
    value: ""
  });

  useEffect(() => {
    if (autoPlay) {
      simulateTyping({
        stream: humanize(initialMessage).stream,
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

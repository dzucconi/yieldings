import React, { useReducer, useRef, useCallback } from "react";
import styled from "styled-components";
import { diffChars } from "diff";

import { audio } from "./audio";
import { EXERCISES, Title } from "./data";
import { Textarea } from "./components/Textarea";
import { Autoplayer } from "./components/Autoplayer";

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

export interface State {
  value: string;
  removed: string;
}

export type Action =
  | { type: "RESET" }
  | { type: "UPDATE"; payload: { value: string } }
  | { type: "APPEND"; payload: { character: string } }
  | { type: "BACKSPACE" };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "RESET":
      return {
        value: "",
        removed: ""
      };
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
    case "APPEND": {
      // audio[action.payload.character === " " ? "space" : "type"].play();
      const nextValue = state.value + action.payload.character;
      return {
        ...state,
        value: nextValue
      };
    }
    case "BACKSPACE": {
      // audio.backspace.play();
      return {
        ...state,
        value: state.value.substr(0, state.value.length - 1),
        removed: state.removed + state.value[state.value.length - 1]
      };
    }
  }
};

interface Props {
  autoPlay?: Title;
}

const App: React.FC<Props> = ({ autoPlay = null }) => {
  const textarea = useRef<HTMLTextAreaElement>(null!);

  const [state, dispatch] = useReducer(reducer, {
    removed: "",
    value: ""
  });

  const handleInput = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement>) => {
      dispatch({
        type: "UPDATE",
        payload: { value: event.currentTarget.value }
      });
    },
    []
  );

  const handleSelect = useCallback(() => textarea.current.select(), []);

  const handleAppend = useCallback((character: string) => {
    audio[character === " " ? "space" : "type"].play();
    console.log({ external: character });
    dispatch({
      type: "APPEND",
      payload: { character }
    });
  }, []);

  const handleBackspace = useCallback(() => {
    audio.backspace.play();
    dispatch({ type: "BACKSPACE" });
  }, []);

  const handleUpdate = useCallback((value: string) => {
    dispatch({ type: "UPDATE", payload: { value } });
    if (value === "") {
      audio.backspace.play();
    }
  }, []);

  const handleReset = useCallback(() => dispatch({ type: "RESET" }), []);

  return (
    <>
      {autoPlay && (
        <Autoplayer
          exercise={EXERCISES[autoPlay]}
          onSelect={handleSelect}
          onAppend={handleAppend}
          onBackspace={handleBackspace}
          onReset={handleReset}
          onUpdate={handleUpdate}
        />
      )}

      <Container>
        <Textarea
          value={state.value}
          autoFocus={state.value === "" || !!autoPlay}
          onInput={handleInput}
          placeholder="Type"
          ref={textarea}
        />
        <Textarea readOnly value={state.removed} placeholder="Removals" />
      </Container>
    </>
  );
};

export default App;

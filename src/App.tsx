import React, { useReducer, useRef, useCallback } from "react";
import styled from "styled-components";
import { diffChars } from "diff";

import { Textarea } from "./components/Textarea";
import { useAutoplay } from "./hooks/useAutoplay";
import { sounds } from "./audio";
import { EXERCISES } from "./data";

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
      sounds.tock.play();
      const nextValue = state.value + action.payload.character;
      return {
        ...state,
        value: nextValue
      };
    }
    case "BACKSPACE": {
      sounds.tock.play();
      return {
        ...state,
        value: state.value.substr(0, state.value.length - 1),
        removed: state.removed + state.value[state.value.length - 1]
      };
    }
  }
};

interface Props {
  autoPlay?: boolean;
}

const App: React.FC<Props> = ({ autoPlay = false }) => {
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
    dispatch({
      type: "APPEND",
      payload: { character }
    });
  }, []);

  const handleBackspace = useCallback(
    () => dispatch({ type: "BACKSPACE" }),
    []
  );

  const handleUpdate = useCallback(
    (value: string) => dispatch({ type: "UPDATE", payload: { value } }),
    []
  );

  const handleReset = useCallback(() => dispatch({ type: "RESET" }), []);

  useAutoplay({
    exercise: EXERCISES["The Sound of A in Fall"],
    autoPlay,
    onSelect: handleSelect,
    onAppend: handleAppend,
    onBackspace: handleBackspace,
    onReset: handleReset,
    onUpdate: handleUpdate
  });

  return (
    <Container>
      <Textarea
        value={state.value}
        autoFocus={state.value === ""}
        onInput={handleInput}
        placeholder="Type"
        ref={textarea}
      />
      <Textarea readOnly value={state.removed} placeholder="Removals" />
    </Container>
  );
};

export default App;

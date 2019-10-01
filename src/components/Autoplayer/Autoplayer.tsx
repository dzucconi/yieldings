import React from "react";
import { createGlobalStyle } from "styled-components";

import { useAutoplay, Props } from "../../hooks/useAutoplay";

const DisableMouse = createGlobalStyle`
  html {
    pointer-events: none;
    cursor: none;
  }
`;

export const Autoplayer: React.FC<Props> = ({
  exercise,
  onSelect,
  onAppend,
  onBackspace,
  onReset,
  onUpdate
}) => {
  useAutoplay({
    exercise,
    onSelect,
    onAppend,
    onBackspace,
    onReset,
    onUpdate
  });

  return <DisableMouse />;
};

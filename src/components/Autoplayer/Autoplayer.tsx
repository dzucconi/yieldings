import React from "react";

import { useAutoplay, Props } from "../../hooks/useAutoplay";

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

  return null;
};

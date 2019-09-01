import React from "react";
import styled from "styled-components";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Input = styled.textarea`
  font-size: 2rem;
  padding: 0.5em 0.75em;
`;

export const Textarea: React.FC<Props> = ({ ...rest }) => <Input {...rest} />;

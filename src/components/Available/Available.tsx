import React from "react";
import styled from "styled-components";

import { EXERCISES, Title } from "../../data";

const Container = styled.div`
  padding: 1em;
`;

const Link = styled.a`
  display: block;
  margin: 0.5em 0;
`;

export const Available = () => {
  return (
    <Container>
      {Object.keys(EXERCISES).map(title => {
        return (
          <Link key={title} href={`/?autoPlay=${encodeURIComponent(title)}`}>
            {title} ({EXERCISES[title as Title].exercises.length})
          </Link>
        );
      })}
    </Container>
  );
};

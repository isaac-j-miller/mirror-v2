import React from "react";
import styled from "styled-components";
import { Clock } from "./clock";

const BaseComplimentDiv = styled.div`
  display: flex;
  flex-direction: column;
  height: 12em;
  margin-left: 1em;
  position: relative;
  top: 0;
`;

const ComplimentDisplay = styled.div`
  font-size: 2em;
  font-weight: bold;
  font-style: italic;
`;

export const Compliment: React.FC<{ compliment: string }> = (props) => {
  const { compliment } = props;
  return (
    <BaseComplimentDiv>
      <Clock></Clock>
      <ComplimentDisplay>{compliment}</ComplimentDisplay>
    </BaseComplimentDiv>
  );
};

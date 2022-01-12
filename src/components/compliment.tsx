import React from "react";
import styled from "styled-components";
import { Clock } from "./clock";

const BaseComplimentDiv = styled.div``;

const ComplimentDisplay = styled.div``;

export const Compliment: React.FC<{ compliment: string }> = (props) => {
  const { compliment } = props;
  return (
    <BaseComplimentDiv>
      <Clock></Clock>
      <ComplimentDisplay>{compliment}</ComplimentDisplay>
    </BaseComplimentDiv>
  );
};

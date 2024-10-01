import React from "react";
import styled from "styled-components";
import strftime from "strftime";

const TimeDisplay = styled.div`
  text-align: left;
  font-size: 5em;
  font-weight: bold;
`;

export const Clock: React.FC = () => {
  const [time, setTime] = React.useState<string>();
  const _setTime = () => {
    const now = new Date();
    const formatted = strftime("%l:%M %P", now);
    setTime(formatted);
  };
  React.useEffect(() => {
    _setTime();
    const interval = setInterval(() => _setTime(), 800);
    return () => {
      clearInterval(interval);
    };
  });

  return <TimeDisplay>{time}</TimeDisplay>;
};

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
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formatted = strftime("%l:%M %P", now);
      setTime(formatted);
    }, 800);
    return () => {
      clearInterval(interval);
    };
  });

  return <TimeDisplay>{time}</TimeDisplay>;
};

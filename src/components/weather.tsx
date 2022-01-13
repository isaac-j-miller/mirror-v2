import React from "react";
import styled from "styled-components";
import { HourlyWeatherInfo } from "../api/weather";

const BaseDiv = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 5px;
  box-shadow: 5px 5px 15px #2b2b2b;
  margin: 0.5em;
  padding: 0.5em;
  padding-right: 1em;
  padding-left: 1em;
  justify-content: flex-end;
  font-size: 1.5em;
  align-items: center;
  border: solid 0.5px #1c1c1c;
`;

const TimeDiv = styled.div``;

const TemperatureDiv = styled.div``;

const WeatherIcon = styled.img`
  height: 3em;
  width: 3em;
  margin-left: 1em;
`;

const LeftDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 3em;
`;

export const WeatherPanel: React.FC<HourlyWeatherInfo> = (props) => {
  const { temperature, time, icon } = props;
  return (
    <BaseDiv>
      <LeftDiv>
        <TemperatureDiv>{temperature}°F</TemperatureDiv>
        <TimeDiv>{time}</TimeDiv>
      </LeftDiv>

      <WeatherIcon src={`icons/${icon}.png`}></WeatherIcon>
    </BaseDiv>
  );
};

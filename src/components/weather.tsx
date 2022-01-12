import React from "react";
import styled from "styled-components";
import { HourlyWeatherInfo } from "../api";

const BaseDiv = styled.div``;

const TimeDiv = styled.div``;

const TemperatureDiv = styled.div``;

const WeatherIcon = styled.img``;

export const WeatherPanel: React.FC<HourlyWeatherInfo> = (props) => {
  const { temperature, time, iconPath } = props;
  return (
    <BaseDiv>
      <TimeDiv>{time}</TimeDiv>
      <TemperatureDiv>{temperature}</TemperatureDiv>
      <WeatherIcon src={iconPath}></WeatherIcon>
    </BaseDiv>
  );
};

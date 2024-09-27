import React from "react";
import styled from "styled-components";
import { DailyWeatherInfo, HourlyWeatherInfo } from "../api/weather";

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
const WeatherIcon = styled.img`
  height: 3em;
  width: 3em;
  margin-left: 1em;
`;

const WeatherIconCenter = styled.img`
  height: 3em;
  width: 3em;
  margin: auto;
`;
const LeftDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 3em;
`;
const DailyForecastContainer = styled.div<{ cols: number }>`
  display: grid;
  rows: 2;
  grid-template-columns: repeat(${(props) => props.cols + 1}, 1fr);
  flex-direction: row;
  height: auto;
  margin: 0.5em;
`;

export const WeatherPanel: React.FC<HourlyWeatherInfo> = (props) => {
  const { temperature, time, icon } = props;
  return (
    <BaseDiv>
      <LeftDiv>
        <div>{temperature}°F</div>
        <div>{time}</div>
      </LeftDiv>

      <WeatherIcon src={`icons/${icon}.png`}></WeatherIcon>
    </BaseDiv>
  );
};

export const DailyWeatherPanels: React.FC<{ info: DailyWeatherInfo[] }> = ({
  info,
}) => {
  return (
    <DailyForecastContainer cols={info.length + 1}>
      <div
        style={{
          gridColumnStart: 1,
          gridColumnEnd: info.length + 2,
          gridRow: 1,
          margin: "auto",
        }}
      >
        <h3
          style={{
            margin: "0px",
          }}
        >
          WEEKLY FORECAST
        </h3>
      </div>
      <div style={{ gridRow: 4, gridColumn: 1 }}>HI</div>
      <div style={{ gridRow: 5, gridColumn: 1 }}>LO</div>
      <div style={{ gridRow: 6, gridColumn: 1 }}>HUMIDITY</div>
      <div style={{ gridRow: 7, gridColumn: 1 }}>UVI</div>
      <div style={{ gridRow: 8, gridColumn: 1 }}>WIND</div>
      {info.map((d, i) => (
        <DailyWeatherPanel key={`d${i}`} {...d} col={i + 2}></DailyWeatherPanel>
      ))}
    </DailyForecastContainer>
  );
};
export const DailyWeatherPanel: React.FC<DailyWeatherInfo & { col: number }> = (
  props
) => {
  const { hi, lo, humidity, uvi, wind, icon, dt } = props;
  return (
    <>
      <div style={{ gridRow: 2, gridColumn: props.col }}>
        {new Date(dt).toLocaleDateString("en-US", { weekday: "long" })}
      </div>
      <WeatherIconCenter
        src={`icons/${icon}.png`}
        style={{ gridRow: 3, gridColumn: props.col }}
      ></WeatherIconCenter>
      <div style={{ gridRow: 4, gridColumn: props.col }}>{hi}°F</div>
      <div style={{ gridRow: 5, gridColumn: props.col }}>{lo}°F</div>
      <div style={{ gridRow: 6, gridColumn: props.col }}>{humidity}%</div>
      <div style={{ gridRow: 7, gridColumn: props.col }}>{uvi}</div>
      <div style={{ gridRow: 8, gridColumn: props.col }}>{wind}&nbsp;MPH</div>
    </>
  );
};

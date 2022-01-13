import React, { useEffect } from "react";
import reactDom from "react-dom";
import styled from "styled-components";
import { getDailyWeatherInfo, HourlyWeatherInfo } from "./api/weather";
import { generateCompliment } from "./api/compliments";
import { Compliment } from "./components/compliment";
import { WeatherPanel } from "./components/weather";

const WEATHER_INTERVAL = 1000 * 60 * 15; // 15 minutes
const COMPLIMENT_INTERVAL = 1000 * 60 * 5; // 5 minutes
const HOURS_TO_SHOW = 12;

const RootContainer = styled.div`
  width: 100%;
  height: 100%;
`;
const ForecastContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  right: 0;
  top: 0;
  overflow: hidden;
`;

const App: React.FC = () => {
  const [weatherForecast, setWeatherForecast] = React.useState<
    HourlyWeatherInfo[]
  >([]);
  const [currentCompliment, setCurrentCompliment] = React.useState<string>(
    generateCompliment()
  );
  const [gotInitialWeather, setGotInitialWeather] =
    React.useState<boolean>(false);

  if (!gotInitialWeather) {
    setGotInitialWeather(true);
    getDailyWeatherInfo(HOURS_TO_SHOW)
      .then((info) => {
        setWeatherForecast(info);
      })
      .catch(console.error);
  }
  useEffect(() => {
    const interval = setInterval(() => {
      getDailyWeatherInfo(HOURS_TO_SHOW)
        .then((info) => {
          setWeatherForecast(info);
        })
        .catch(console.error);
    }, WEATHER_INTERVAL);
    const complimentInterval = setInterval(() => {
      const compliment = generateCompliment();
      setCurrentCompliment(compliment);
    }, COMPLIMENT_INTERVAL);
    return () => {
      clearInterval(interval);
      clearInterval(complimentInterval);
    };
  });
  return (
    <RootContainer>
      <Compliment compliment={currentCompliment}></Compliment>
      <ForecastContainer>
        {weatherForecast &&
          weatherForecast.map((hourWeather) => (
            <WeatherPanel
              key={hourWeather.time}
              {...hourWeather}
            ></WeatherPanel>
          ))}
      </ForecastContainer>
    </RootContainer>
  );
};
const div = document.createElement("div");
document.head.innerHTML += `<style>
html {
  color: white; 
  background-color: black; 
  font-family: helvetica;
}
</style>`;
document.body.appendChild(div);
reactDom.render(<App></App>, div);

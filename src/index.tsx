import React, { useEffect } from "react";
import reactDom from "react-dom";
import styled from "styled-components";
import { getDailyWeatherInfo, HourlyWeatherInfo } from "./api";
import { generateCompliment } from "./compliments";
import { Compliment } from "./components/compliment";
import { WeatherPanel } from "./components/weather";

const WEATHER_INTERVAL = 1000 * 60 * 15; // 15 minutes
const COMPLIMENT_INTERVAL = 1000 * 60 * 5; // 5 minutes
const HOURS_TO_SHOW = 12;

const RootContainer = styled.div``;
const ForecastContainer = styled.div``;

const App: React.FC = () => {
  const [weatherForecast, setWeatherForecast] =
    React.useState<HourlyWeatherInfo[]>();
  const [currentCompliment, setCurrentCompliment] = React.useState<string>(
    generateCompliment()
  );

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
            <WeatherPanel {...hourWeather}></WeatherPanel>
          ))}
      </ForecastContainer>
    </RootContainer>
  );
};

reactDom.render(<App></App>, document);

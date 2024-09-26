import React, { useEffect } from "react";
import styled from "styled-components"
import { getDailyWeatherInfo, HourlyWeatherInfo } from "./api/weather";
import { generateCompliment } from "./api/compliments";
import { Compliment } from "./components/compliment";
import { WeatherPanel } from "./components/weather";

const COMPLIMENT_INTERVAL = 300000; // 5 minutes
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

import './App.css'

const App: React.FC = () => {
  const [weatherForecast, setWeatherForecast] = React.useState<
    HourlyWeatherInfo[]
  >([]);
  const [currentCompliment, setCurrentCompliment] = React.useState<string>();
  const [gotInitialWeather, setGotInitialWeather] =
    React.useState<boolean>(false);
  const getWeather = (cb?: () => void) => {
    getDailyWeatherInfo(HOURS_TO_SHOW)
      .then((info) => {
        console.debug("setState weatherForecast");
        setWeatherForecast(info);
        if(cb) {
          cb()
        }
      })
      .catch((err) => {
        console.error(`Error fetching weather: ${err.name} ${err.message}`);
        if(cb) {
          cb()
        }
      });
  };
  if (!gotInitialWeather) {
    console.debug("setting initial weather");
    setGotInitialWeather(true);
    getWeather();
  }
  useEffect(() => {
    const time = new Date();
    const thisHour = time.getHours();
    const nextHour = new Date(
      time.getFullYear(),
      time.getMonth(),
      time.getDate(),
      thisHour + 1,
      0,
      1,
      0
    );
    const diff = nextHour.valueOf() - time.valueOf();
    const intervals: NodeJS.Timeout[] = [];
    const intervalMs = 1000 * 3600;
    console.info(
      `Set timeout to query weather ${(diff / (1000 * 60)).toPrecision(
        3
      )} minutes from now (${nextHour.toISOString()})`
    );
    const timeout = setTimeout(() => {
      getWeather(() =>
        console.info(
          `Will query weather again at ${new Date(
            new Date().valueOf() + intervalMs
          ).toISOString()}`
        )
      );
      const interval = setInterval(() => {
        getWeather(() =>
          console.info(
            `Will query weather again at ${new Date(
              new Date().valueOf() + intervalMs
            ).toISOString()}`
          )
        );
      }, intervalMs);
      intervals.pop();
      intervals.push(interval);
    }, diff);

    return () => {
      console.info("clearing timeouts/intervals");
      try {
        clearTimeout(timeout);
      } catch (err) {
        // noop
      }
      intervals.forEach(x => clearInterval(x));
    };
  }, []);

  useEffect(() => {
    setCurrentCompliment(generateCompliment());
    const complimentInterval = setInterval(() => {
      const compliment = generateCompliment();
      setCurrentCompliment(compliment);
    }, COMPLIMENT_INTERVAL);
    return () => {
      clearInterval(complimentInterval);
    };
  }, []);

  return (
    <RootContainer>
      {currentCompliment && (
        <Compliment compliment={currentCompliment}></Compliment>
      )}
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

export default App
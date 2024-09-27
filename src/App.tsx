import React, { useEffect } from "react";
import styled from "styled-components";
import { getDailyWeatherInfo, WeatherData } from "./api/weather";
import { generateCompliment } from "./api/compliments";
import { Compliment } from "./components/compliment";
import { DailyWeatherPanels, WeatherPanel } from "./components/weather";
import "./App.css";

const COMPLIMENT_INTERVAL = 300000; // 5 minutes
const HOURS_TO_SHOW = 12;
const DAYS_TO_SHOW = 5;

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

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  left: 0;
  top: 0;
  overflow: hidden;
`;

const App: React.FC = () => {
  const [weatherForecast, setWeatherForecast] = React.useState<WeatherData>();
  const [currentCompliment, setCurrentCompliment] = React.useState<string>();
  const [gotInitialWeather, setGotInitialWeather] =
    React.useState<boolean>(false);
  const getWeather = (cb?: () => void) => {
    getDailyWeatherInfo(HOURS_TO_SHOW, DAYS_TO_SHOW)
      .then((info) => {
        console.debug("setState weatherForecast");
        setWeatherForecast(info);
        if (cb) {
          cb();
        }
      })
      .catch((err) => {
        console.error(`Error fetching weather: ${err.name} ${err.message}`);
        if (cb) {
          cb();
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
        console.debug(err);
      }
      intervals.forEach((x) => clearInterval(x));
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
      <LeftContainer>
        {currentCompliment && (
          <Compliment compliment={currentCompliment}></Compliment>
        )}
        {weatherForecast?.daily && (
          <DailyWeatherPanels info={weatherForecast.daily} />
        )}
      </LeftContainer>

      <ForecastContainer>
        {weatherForecast?.hourly &&
          weatherForecast.hourly.map((hourWeather) => (
            <WeatherPanel
              key={hourWeather.time}
              {...hourWeather}
            ></WeatherPanel>
          ))}
      </ForecastContainer>
    </RootContainer>
  );
};

export default App;

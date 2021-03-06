import React, { useEffect } from "react";
import reactDom from "react-dom";
import styled from "styled-components";
import { io } from "socket.io-client";
import { getDailyWeatherInfo, HourlyWeatherInfo } from "./api/weather";
import { generateCompliment } from "./api/compliments";
import { Compliment } from "./components/compliment";
import { WeatherPanel } from "./components/weather";
import { patchConsole } from "./monkey";

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
        cb && cb();
      })
      .catch((err) => {
        console.error(`Error fetching weather: ${err.name} ${err.message}`);
        cb && cb();
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
    const intervals: NodeJS.Timer[] = [];
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
      intervals.forEach(clearInterval);
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

let timeouts: NodeJS.Timeout[] = [];

const div = document.createElement("div");
document.head.innerHTML += `<style>
  html {
    color: white; 
    background-color: black; 
    font-family: helvetica;
  }
  </style>`;
document.body.appendChild(div);

const socket = io();
socket.timeout(10000).on("connect", (err?: Error) => {
  if (err) {
    console.warn("Websocket connect request timed out, rendering anyway");
  } else {
    patchConsole(socket);
    console.info("connected to socket");
  }
  reactDom.render(<App></App>, div);
});
socket.on("reload", () => {
  console.info("reload requested");
  timeouts.push(
    setTimeout(() => {
      console.info("reloading");
      timeouts.forEach((timeout) => {
        try {
          clearTimeout(timeout);
        } catch (err) {
          // noop
        }
      });
      timeouts = [];
      location.reload();
    }, 10000)
  );
});

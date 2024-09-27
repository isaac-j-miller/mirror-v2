import axios from "axios";
import strftime from "strftime";

export type HourlyWeatherInfo = {
  dt: number;
  time: string;
  temperature: string;
  icon: WeatherIcon;
};
export type DailyWeatherInfo = {
  dt: number;
  time: string;
  hi: string;
  lo: string;
  uvi: string;
  wind: string;
  humidity: string;
  icon: WeatherIcon;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type WeatherAlert = {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
};

// Truncation of the format specified here: https://openweathermap.org/api/hourly-forecast#JSON
type WeatherApiResponse = {
  cod: string;
  message: number;
  cnt: number;
  hourly: HourlyEntry[];
  daily: DailyEntry[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
  alerts: WeatherAlert[];
};

type HourlyEntry = {
  dt: number; // timestamp in milliseconds since epoch
  temp: number;
  weather: [
    {
      id: number;
      main: string;
      description: string;
      icon: WeatherIcon;
    }
  ];
};

type DailyEntry = {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  summary: string;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: [
    {
      id: number;
      main: string;
      description: string;
      icon: WeatherIcon;
    }
  ];
  clouds: number;
  pop: number;
  rain: number;
  uvi: number;
};

export type WeatherData = {
  daily: DailyWeatherInfo[];
  hourly: HourlyWeatherInfo[];
};

type WeatherIcon =
  | "01d"
  | "01n"
  | "02d"
  | "02n"
  | "03d"
  | "03n"
  | "04d"
  | "04n"
  | "09d"
  | "09n"
  | "10d"
  | "10n"
  | "11d"
  | "11n"
  | "13d"
  | "13n"
  | "50d"
  | "50n";

const API_KEY = process.env.WEATHER_API_KEY;
const baseUrl = "https://api.openweathermap.org/data/3.0/onecall";

const once = <T>(fn: () => T): (() => T) => {
  let res: T | undefined;
  return () => {
    if (res) return res;
    res = fn();
    return res;
  };
};

const getLatLon = once(async (): Promise<Coordinates> => {
  console.info("getting location from ipapi...");
  try {
    const resp = await axios.get<Coordinates>("https://ipapi.co/json", {
      withCredentials: false,
    });
    const { latitude, longitude } = resp.data;
    return { latitude, longitude };
  } catch (err) {
    console.error(
      `Error getting IP info from ipapi: ${(err as Error).name} ${
        (err as Error).message
      }`
    );
    try {
      console.info("Attempting to get IP info from ipinfo");
      const ipinfoResp = await axios.get<{ loc: string }>(
        "https://ipapi.co/json",
        {
          withCredentials: false,
        }
      );
      const { loc } = ipinfoResp.data;
      const [latitude, longitude] = loc.split(",").map(Number);
      return { latitude, longitude };
    } catch (err2) {
      console.error(
        `Error getting IP info from ipinfo:  ${(err2 as Error).name} ${
          (err2 as Error).message
        }`
      );
      console.warn(`Returning default coordinates (DC)...`);
      return {
        latitude: 38.9982,
        longitude: -77.0338,
      };
    }
  }
});

function hourlyEntryToHourlyWeatherInfo(entry: HourlyEntry): HourlyWeatherInfo {
  const date = new Date(entry.dt * 1000);
  return {
    dt: entry.dt * 1000,
    time: strftime("%l:00 %P", date),
    icon: entry.weather[0].icon,
    temperature: entry.temp.toFixed(0),
  };
}

function dailyEntryToDailyWeatherInfo(entry: DailyEntry): DailyWeatherInfo {
  const date = new Date(entry.dt * 1000);
  return {
    dt: entry.dt * 1000,
    time: strftime("%l:00 %P", date),
    icon: entry.weather[0].icon,
    lo: entry.temp.min.toFixed(0),
    hi: entry.temp.max.toFixed(0),
    humidity: entry.humidity.toFixed(0),
    uvi: entry.uvi.toFixed(0),
    wind: entry.wind_speed.toFixed(0),
  };
}
export async function getDailyWeatherInfo(
  hoursToShow: number,
  daysToShow: number
): Promise<WeatherData> {
  console.info(`Attempting to fetch weather...`);
  const { latitude, longitude } = await getLatLon();
  const query = `?lat=${latitude.toFixed(8)}&lon=${longitude.toFixed(
    8
  )}&units=imperial&lang=en&appid=${API_KEY}&exclude=current,minutely`;
  const url = encodeURI(`${baseUrl}${query}`);
  try {
    const resp = await axios.get<WeatherApiResponse>(url, {
      withCredentials: false,
    });
    console.info(`Got response from weather API`);
    const hourly = resp.data.hourly
      .slice(0, hoursToShow)
      .map(hourlyEntryToHourlyWeatherInfo);
    const daily = resp.data.daily
      .slice(0, daysToShow)
      .map(dailyEntryToDailyWeatherInfo);
    return {
      hourly,
      daily,
    };
  } catch (err) {
    console.error(
      `Error getting weather: ${(err as Error).name} ${(err as Error).message}`
    );
    throw err;
  }
}

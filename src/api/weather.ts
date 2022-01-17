import axios from "axios";
import strftime from "strftime";

export type HourlyWeatherInfo = {
  dt: number;
  time: string;
  temperature: string;
  icon: WeatherIcon;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

// Truncation of the format specified here: https://openweathermap.org/api/hourly-forecast#JSON
type WeatherApiResponse = {
  cod: string;
  message: number;
  cnt: number;
  hourly: HourlyEntry[];
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
const baseUrl = "https://api.openweathermap.org/data/2.5/onecall";

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

export async function getDailyWeatherInfo(
  hoursToShow: number
): Promise<HourlyWeatherInfo[]> {
  console.info(`Attempting to fetch weather...`);
  const { latitude, longitude } = await getLatLon();
  const query = `?lat=${latitude.toFixed(8)}&lon=${longitude.toFixed(
    8
  )}&units=imperial&lang=en&appid=${API_KEY}&exclude=current,minutely,daily`;
  const url = encodeURI(`${baseUrl}${query}`);
  try {
    const resp = await axios.get<WeatherApiResponse>(url, {
      withCredentials: false,
    });
    console.info(`Got response from weather API`);
    const hourlyWeatherInfo = resp.data.hourly
      .slice(0, hoursToShow)
      .map(hourlyEntryToHourlyWeatherInfo);
    return hourlyWeatherInfo;
  } catch (err) {
    console.error(
      `Error getting weather: ${(err as Error).name} ${(err as Error).message}`
    );
    throw err;
  }
}

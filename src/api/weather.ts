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

type IpInfoResp = {
  loc: `${number},${number}`;
};

const API_KEY = process.env.WEATHER_API_KEY;
const baseUrl = "https://api.openweathermap.org/data/2.5/onecall";

async function getLatLon(): Promise<Coordinates> {
  const promise = new Promise<Coordinates>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position.coords);
      },
      (error) => {
        console.error(`Error getting location: ${error}`);
        axios
          .get<IpInfoResp>("https://ipinfo.io/json", {
            withCredentials: false,
          })
          .then(
            (resp) => {
              const [latitude, longitude] = resp.data.loc
                .split(",")
                .map(Number);
              resolve({
                latitude,
                longitude,
              });
            },
            (err) => {
              console.error(`Error getting IP info: ${err}`);
              reject(err);
            }
          );
      }
    );
  });
  return promise;
}

function hourlyEntryToHourlyWeatherInfo(entry: HourlyEntry): HourlyWeatherInfo {
  const date = new Date(entry.dt * 1000);
  return {
    dt: entry.dt * 1000,
    time: strftime("%l:00 %P", date),
    icon: entry.weather[0].icon,
    temperature: entry.temp.toFixed(0),
  };
}

export class WeatherCache {
  private cache: HourlyWeatherInfo[];
  private lastEntry: number;
  static instance: WeatherCache;
  private constructor(private apiKey: string | undefined) {
    this.cache = [];
    if (!apiKey) {
      throw new Error("API_KEY is required");
    }
    this.lastEntry = 0;
  }
  static getInstance() {
    if (!WeatherCache.instance) {
      WeatherCache.instance = new WeatherCache(API_KEY);
    }
    return WeatherCache.instance;
  }
  async getHourlyWeatherInfo(hours: number) {
    const now = new Date();
    const epochTime = now.valueOf();
    const nHoursFromNow = epochTime + hours * 1000 * 3600;
    if (this.lastEntry < nHoursFromNow) {
      this.cache = await this.makeAPICall(hours + 1);
      if (this.cache.length > 0) {
        this.lastEntry = this.cache[this.cache.length - 1].dt;
      }
    }
    let firstRelevantIndex = this.cache.findIndex(
      (cacheValue) => cacheValue.time === strftime("%l:00 %P", now)
    );
    if (firstRelevantIndex < 0) {
      this.cache = await this.makeAPICall(hours + 1);
      firstRelevantIndex = 0;
    }
    this.cache = this.cache.slice(firstRelevantIndex);
    return this.cache.slice(0, hours);
  }
  private async makeAPICall(hoursToShow: number) {
    try {
      console.info(`Attempting to fetch weather`);
      const { latitude, longitude } = await getLatLon();
      const query = `?lat=${latitude.toFixed(8)}&lon=${longitude.toFixed(
        8
      )}&units=imperial&lang=en&appid=${
        this.apiKey
      }&exclude=current,minutely,daily`;
      const url = encodeURI(`${baseUrl}${query}`);
      const resp = await axios.get<WeatherApiResponse>(url, {
        withCredentials: false,
      });
      console.info(`Got response from weather API`);
      const hourlyWeatherInfo = resp.data.hourly
        .slice(0, hoursToShow)
        .map(hourlyEntryToHourlyWeatherInfo);
      return hourlyWeatherInfo;
    } catch (err) {
      console.error(`Error getting weather info: ${err}`);
      return [];
    }
  }
}

const instance = WeatherCache.getInstance();
export async function getDailyWeatherInfo(
  hoursToShow: number
): Promise<HourlyWeatherInfo[]> {
  return instance.getHourlyWeatherInfo(hoursToShow);
}

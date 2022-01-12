import axios from "axios";
import strftime from "strftime";

export type HourlyWeatherInfo = {
  time: string;
  temperature: string;
  iconPath: string;
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
  list: HourlyEntry[];
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
  main: {
    temp: number;
  };
  weather: [
    {
      id: number;
      main: string;
      description: string;
      icon: string;
    }
  ];
};

type IpInfoResp = {
  loc: `${number},${number}`;
};

const API_KEY = process.env.WEATHER_API_KEY;
const baseUrl = "pro.openweathermap.org/data/2.5/forecast/hourly";

async function getLatLon(): Promise<Coordinates> {
  const promise = new Promise<Coordinates>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position.coords);
      },
      (error) => {
        console.error(`Error getting location: ${error}`);
        axios.get<IpInfoResp>("https://ipinfo.io/json").then(
          (resp) => {
            const [latitude, longitude] = resp.data.loc.split(",").map(Number);
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
  const date = new Date(entry.dt);
  return {
    time: strftime("%l:%M %p", date),
    iconPath: entry.weather[0].icon,
    temperature: entry.main.temp.toFixed(0),
  };
}

// TODO: caching

export async function getDailyWeatherInfo(
  hoursToShow: number
): Promise<HourlyWeatherInfo[]> {
  if (!API_KEY) {
    return [];
  }
  try {
    const { latitude, longitude } = await getLatLon();
    const query = `?lat=${latitude.toFixed(8)}&lon=${longitude.toFixed(
      8
    )}&appid=${API_KEY}&units=imperial&lang=en`;
    const url = `${baseUrl}${query}`;
    const resp = await axios.get<WeatherApiResponse>(url);
    const hourlyWeatherInfo = resp.data.list
      .slice(0, hoursToShow)
      .map(hourlyEntryToHourlyWeatherInfo);
    return hourlyWeatherInfo;
  } catch (err) {
    console.error(`Error getting weather info: ${err}`);
    return [];
  }
}

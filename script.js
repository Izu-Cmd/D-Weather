// D-Weather — clean weather app using Open-Meteo (no API key required)

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusEl = document.getElementById("status");
const weatherCard = document.getElementById("weatherCard");

const cityNameEl = document.getElementById("cityName");
const countryNameEl = document.getElementById("countryName");
const tempValueEl = document.getElementById("tempValue");
const conditionTextEl = document.getElementById("conditionText");
const feelsLikeEl = document.getElementById("feelsLike");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");

const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

async function geocode(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }
  return data.results[0];
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();
  return data.current;
}

function describeWeather(code) {
  return WEATHER_CODES[code] || "Unknown";
}

function render(location, current) {
  cityNameEl.textContent = location.name;
  countryNameEl.textContent = location.country || "";
  tempValueEl.textContent = Math.round(current.temperature_2m);
  conditionTextEl.textContent = describeWeather(current.weather_code);
  feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;
  humidityEl.textContent = `${current.relative_humidity_2m}%`;
  windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  weatherCard.hidden = false;
}

async function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    setStatus("Please enter a city name.");
    return;
  }

  setStatus("Loading…");
  weatherCard.hidden = true;

  try {
    const location = await geocode(city);
    const current = await fetchWeather(location.latitude, location.longitude);
    render(location, current);
    setStatus("");
  } catch (err) {
    setStatus(err.message === "City not found"
      ? `Couldn't find "${city}". Try another city.`
      : "Something went wrong. Check your connection and try again.");
  }
}

searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

window.addEventListener("DOMContentLoaded", () => {
  cityInput.value = "Lagos";
  handleSearch();
});
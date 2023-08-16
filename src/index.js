//`https://api.weatherapi.com/v1/current.json?key=092b5d87a69749d8ad2211113231405&q=${location}`
import "./style.css";
const { parseISO, format, getDay } = require("date-fns");
const img = document.querySelector("img");
const country = document.querySelector(".country");
const city = document.querySelector(".city");

const inputBar = document.querySelector(".searchCountry");
const searchButton = document.querySelector(".searchButton");
const board = document.querySelector(".locationList");
const windSpeed = document.querySelector(".windSpeed");
const countryName = document.querySelector(".country");
const tempNumber = document.querySelector(".tempNumber");

const tempUnitToggle = document.querySelector(".tempUnitToggle");

const moonIcon = '<i class="fa-solid fa-moon"></i>';
const cloudMoonIcon = '<i class="fa-solid fa-cloud-moon"></i>';
const sunIcon = '<i class="fa-solid fa-sun"></i>';
const cloudSunIcon = '<i class="fa-solid fa-cloud-sun"></i>';
const fogIcon = '<i class="fa-solid fa-smog"></i>';
const rainIcon = '<i class="fa-solid fa-cloud-rain"></i>';
const snowIcon = '<i class="fa-solid fa-snowflake"></i>';

let lat;
let long;
let cityName;
let countryNameVar;

let tempUnit = "celsius";
let speedUnit = "ms";
searchButton.addEventListener("click", () => {
  geoLocation(inputBar.value);
});
async function getCats(
  latitude = 52.37,
  longitude = 4.89,
  name = "Amsterdam",
  country = "Netherlands",
  windspeed = "ms",
  temp = "celsius"
) {
  let unitSpeed;
  let unitTemp;
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&current_weather=true&windspeed_unit=${windspeed}&temperature_unit=${temp}`,
    { mode: "cors" }
  );

  const weatherData = await response.json();
  console.log(weatherData);
  city.innerHTML = `${name}`;
  countryName.innerHTML = country;
  if (temp === "celsius") {
    unitTemp = "°C";
    unitSpeed = "m/s";
  } else {
    unitTemp = "°F";
    unitSpeed = "mi/h";
  }

  tempNumber.innerText = `${weatherData.current_weather.temperature}${unitTemp}`;
  windSpeed.innerHTML = `Wind: ${weatherData.current_weather.windspeed} ${unitSpeed}`;
  weatherIconSetter(
    weatherData.current_weather.weathercode,
    weatherData.current_weather.is_day
  );
  parseData(weatherData, unitTemp);
  lat = latitude;
  long = longitude;
  cityName = name;
  countryNameVar = country;
}
tempUnitToggle.addEventListener("click", unitToggle);
getCats();

function parseData(WeatherData, unitTemp) {
  const weeklyWeather = document.querySelector(".weeklyForecast");
  weeklyWeather.innerHTML = "";
  for (let i = 0; i < WeatherData.daily.time.length; i++) {
    console.log(i);
    let day = WeatherData.daily.time[i];
    let temp_min = WeatherData.daily.temperature_2m_min[i];
    let temp_max = WeatherData.daily.temperature_2m_max[i];
    const dailyTempMin = document.createElement("div");
    dailyTempMin.className = "dailyTempMin";
    const dailyTempMax = document.createElement("div");
    dailyTempMax.className = "dailyTempMax";
    dailyTempMax.innerHTML = `High: ${temp_max} ${unitTemp}`;
    dailyTempMin.innerHTML = `Low: ${temp_min} ${unitTemp}`;
    const parsedDate = parseISO(day);
    const dayOfWeek = getDay(parsedDate);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[dayOfWeek];
    const dayDiv = document.createElement("div");
    dayDiv.className = "dayName";
    dayDiv.innerHTML = dayName;
    const dayContainer = document.createElement("div");
    dayContainer.className = "dayContainer";
    dayContainer.appendChild(dayDiv);
    dayContainer.appendChild(dailyTempMin);
    dayContainer.appendChild(dailyTempMax);
    weeklyWeather.appendChild(dayContainer);
    console.log(`The day of the week for ${day} is ${dayName}`);
  }
  return;
}
function createLocationItems(locations) {
  board.innerHTML = "";
  for (let i = 0; i < locations.results.length; i++) {
    const newLocation = document.createElement("div");
    newLocation.className = "locationItem";
    newLocation.id = locations.results[i].id;
    newLocation.innerHTML = locations.results[i].name;
    if (locations.results[i].admin2) {
      newLocation.innerHTML += ", " + locations.results[i].admin2;
    }
    newLocation.innerHTML +=
      ", " + locations.results[i].admin1 + ", " + locations.results[i].country;
    const arg = locations.results[i];
    newLocation.addEventListener("click", () => {
      console.log(arg.latitude, arg.longitude);
      getCats(
        arg.latitude,
        arg.longitude,
        arg.name,
        arg.country,
        speedUnit,
        tempUnit
      );

      board.close();
    });
    board.appendChild(newLocation);
    board.close();
    board.showModal();
  }
}
async function geoLocation(location = "Amsterdam") {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=10&language=en&format=json`,
    { mode: "cors" }
  );
  const geoLocationResult = await response.json();
  console.log(geoLocationResult);
  createLocationItems(geoLocationResult);
}
function weatherIconSetter(weatherCode, isDay) {
  const weatherIcon = document.querySelector(".weatherIcon");
  const cloudCond = document.querySelector(".cloudCond");
  if (weatherCode === 0) {
    if (isDay) {
      weatherIcon.innerHTML = sunIcon;
    } else {
      weatherIcon.innerHTML = moonIcon;
    }
    cloudCond.innerHTML = `<p>Clear Sky</p>`;
    return;
  }
  if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) {
    if (isDay) {
      weatherIcon.innerHTML = cloudSunIcon;
    } else {
      weatherIcon.innerHTML = cloudMoonIcon;
    }
    cloudCond.innerHTML = `<p>Cloudy Sky</p>`;
    return;
  }
  if (weatherCode === 45 || weatherCode === 48) {
    weatherIcon.innerHTML = fogIcon;
    cloudCond.innerHTML = `<p>Foggy Sky</p>`;
    return;
  }
  if (
    weatherCode === 71 ||
    weatherCode === 73 ||
    weatherCode === 75 ||
    weatherCode === 77 ||
    weatherCode === 85 ||
    weatherCode === 86
  ) {
    weatherIcon.innerHTML = snowIcon;
    cloudCond.innerHTML = `<p>Snowing</p>`;
    return;
  } else {
    weatherIcon.innerHTML = rainIcon;
    cloudCond.innerHTML = `<p>Raining</p>`;
    return;
  }
}
function unitToggle() {
  if (!tempUnitToggle.classList.contains("active")) {
    tempUnitToggle.innerHTML = "°F, mph";
    tempUnit = "fahrenheit";
    speedUnit = "mph";
  } else {
    tempUnitToggle.innerHTML = "°C, m/s";
    tempUnit = "celsius";
    speedUnit = "ms";
  }
  tempUnitToggle.classList.toggle("active");
  getCats(lat, long, cityName, countryNameVar, speedUnit, tempUnit);
}

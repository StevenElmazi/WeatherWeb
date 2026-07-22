document.addEventListener('DOMContentLoaded', () => {
    const cityEl = document.getElementById('city');
    const countryEl = document.getElementById('country');
    const coordinatesEl = document.getElementById('coordinates');
    const locationBtn = document.getElementById('locationBtn');

    const temperatureEl = document.getElementById('temperature');
    const weatherDescriptionEl = document.getElementById('weatherDescription');
    const weatherIconEl = document.getElementById('weatherIcon');
    const feelsLikeEl = document.getElementById('feelsLike');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('windSpeed');
    const windDirectionEl = document.getElementById('windDirection');
    const pressureEl = document.getElementById('pressure');
    const visibilityEl = document.getElementById('visibility');
    const cloudsEl = document.getElementById('clouds');
    const uvIndexEl = document.getElementById('uvIndex');
    const sunriseEl = document.getElementById('sunrise');
    const sunsetEl = document.getElementById('sunset');
    const rainChanceEl = document.getElementById('rainChance');
    const moonPhaseEl = document.getElementById('moonPhase');
    const timezoneEl = document.getElementById('timezone');
    const lastUpdatedEl = document.getElementById('lastUpdated');
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    const hourlyForecastEl = document.getElementById('hourlyForecast');
    const weeklyForecastEl = document.getElementById('weeklyForecast');

    const showMessage = (title, subtitle = '') => {
        if (cityEl) cityEl.textContent = title;
        if (countryEl) countryEl.textContent = subtitle;
    };

    const formatTime = (value) => {
        if (!value) return '--';
        const date = new Date(value);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (value) => {
        if (!value) return '--';
        const date = new Date(value);
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const setWeatherIcon = (code) => {
        const icons = {
            0: '01d',
            1: '02d',
            2: '03d',
            3: '04d',
            45: '50d',
            48: '50d',
            51: '09d',
            53: '09d',
            55: '09d',
            61: '10d',
            63: '10d',
            65: '10d',
            71: '13d',
            73: '13d',
            75: '13d',
            95: '11d',
            96: '11d',
            99: '11d'
        };

        const icon = icons[code] || '01d';
        if (weatherIconEl) {
            weatherIconEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        }
    };

    const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    const requestLocation = () => {
        if (!navigator.geolocation) {
            showMessage('Geolocation is not supported', 'Your browser cannot request location access.');
            return;
        }

        if (!isSecureContext) {
            showMessage('Location access needs HTTPS or localhost', 'Open the app through a secure URL or Localhost to allow permission prompts.');
            return;
        }

        showMessage('Requesting location...', 'Please allow location access in your browser.');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                if (coordinatesEl) {
                    coordinatesEl.textContent = `Latitude: ${latitude.toFixed(3)}  Longitude: ${longitude.toFixed(3)}`;
                }

                try {
                    const reverseResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                    const reverseData = await reverseResponse.json();

                    const placeName = reverseData.address.city
                        || reverseData.address.town
                        || reverseData.address.village
                        || reverseData.address.county
                        || 'Your location';

                    const countryName = reverseData.address.country || '---';

                    if (cityEl) cityEl.textContent = placeName;
                    if (countryEl) countryEl.textContent = countryName;

                    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation_probability,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,visibility&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`;
                    const weatherResponse = await fetch(weatherUrl);
                    const weatherData = await weatherResponse.json();

                    const current = weatherData.current;
                    const hourly = weatherData.hourly;
                    const daily = weatherData.daily;

                    if (temperatureEl) temperatureEl.textContent = `${Math.round(current.temperature_2m)}°`;
                    if (weatherDescriptionEl) weatherDescriptionEl.textContent = getWeatherDescription(current.weather_code);
                    if (weatherIconEl) setWeatherIcon(current.weather_code);
                    if (feelsLikeEl) feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°`;
                    if (humidityEl) humidityEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
                    if (windSpeedEl) windSpeedEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
                    if (windDirectionEl) windDirectionEl.textContent = `${Math.round(current.wind_direction_10m)}°`;
                    if (pressureEl) pressureEl.textContent = `${Math.round(current.surface_pressure)} hPa`;
                    if (visibilityEl) visibilityEl.textContent = `${Math.round(current.visibility / 1000)} km`;
                    if (cloudsEl) cloudsEl.textContent = `${Math.round(current.precipitation_probability)}%`;
                    if (uvIndexEl) uvIndexEl.textContent = '--';
                    if (sunriseEl) sunriseEl.textContent = formatTime(daily.sunrise[0]);
                    if (sunsetEl) sunsetEl.textContent = formatTime(daily.sunset[0]);
                    if (rainChanceEl) rainChanceEl.textContent = `${Math.round(daily.precipitation_probability_max[0])}%`;
                    if (moonPhaseEl) moonPhaseEl.textContent = 'Live';
                    if (timezoneEl) timezoneEl.textContent = weatherData.timezone || '---';
                    if (lastUpdatedEl) lastUpdatedEl.textContent = new Date().toLocaleString();

                    if (clockEl) {
                        const now = new Date();
                        clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    }
                    if (dateEl) {
                        dateEl.textContent = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                    }

                    if (hourlyForecastEl) {
                        hourlyForecastEl.innerHTML = hourly.time.slice(0, 8).map((time, index) => {
                            const temp = Math.round(hourly.temperature_2m[index]);
                            const code = hourly.weather_code[index];
                            return `<div class="forecast-item"><p>${new Date(time).toLocaleTimeString([], { hour: 'numeric' })}</p><img src="https://openweathermap.org/img/wn/${getOpenMeteoIcon(code)}@2x.png" alt="weather"><strong>${temp}°</strong></div>`;
                        }).join('');
                    }

                    if (weeklyForecastEl) {
                        weeklyForecastEl.innerHTML = daily.time.slice(0, 7).map((day, index) => {
                            const maxTemp = Math.round(daily.temperature_2m_max[index]);
                            const minTemp = Math.round(daily.temperature_2m_min[index]);
                            const code = daily.weather_code[index];
                            return `<div class="forecast-day"><p>${new Date(day).toLocaleDateString([], { weekday: 'short' })}</p><img src="https://openweathermap.org/img/wn/${getOpenMeteoIcon(code)}@2x.png" alt="weather"><div><strong>${maxTemp}°</strong><span>${minTemp}°</span></div></div>`;
                        }).join('');
                    }
                } catch (error) {
                    showMessage('Location detected', 'Weather lookup failed.');
                }
            },
            (error) => {
                if (error.code === 1) {
                    showMessage('Location permission denied', 'Please allow location access to use this feature.');
                } else {
                    showMessage('Unable to detect your location', 'Try again or check your browser settings.');
                }
            }
        );
    };

    if (locationBtn) {
        locationBtn.addEventListener('click', requestLocation);
    } else {
        requestLocation();
    }
});

function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        95: 'Thunderstorm',
        96: 'Thunderstorm with hail',
        99: 'Thunderstorm with hail'
    };
    return descriptions[code] || 'Weather update';
}

function getOpenMeteoIcon(code) {
    const icons = {
        0: '01d',
        1: '02d',
        2: '03d',
        3: '04d',
        45: '50d',
        48: '50d',
        51: '09d',
        53: '09d',
        55: '09d',
        61: '10d',
        63: '10d',
        65: '10d',
        71: '13d',
        73: '13d',
        75: '13d',
        95: '11d',
        96: '11d',
        99: '11d'
    };
    return icons[code] || '01d';
}

async function checkSafety() {
  const city = document.getElementById("cityInput").value.trim();
  const apiKey = "7c9e2843d21f5756c0c840288752fc4d"; // Replace with your actual OpenWeatherMap API key

  if (!city) {
    showResult("Please enter a city name.", "unsafe");
    return;
  }

  try {
    // Step 1: Get coordinates
    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
    const geoData = await geoRes.json();
    if (!geoData.length) {
      showResult("City not found. Try again.", "unsafe");
      return;
    }

    const { lat, lon } = geoData[0];

    // Step 2: Get weather + UV
    const weatherRes = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`);

    const weatherData = await weatherRes.json();
    if (!weatherData.current) throw new Error("Missing weather data");

    const temp = weatherData.current.temp;
    const uvi = weatherData.current.uvi;
    const rain = weatherData.current.rain?.["1h"] || 0;

    // Step 3: Get AQI (proxy for PSI)
    const airRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const airData = await airRes.json();
    const aqi = airData.list[0].main.aqi;

    // Step 4: Safety logic
    let status = "safe";
    let message = `
      📍 <strong>${city}</strong><br>
      🌡️ Temperature: ${temp}°C<br>
      🌧️ Precipitation: ${rain} mm<br>
      🌞 UV Index: ${uvi}<br>
      🏭 AQI (proxy for PSI): ${aqi}
    `;

    if (temp < 15 || temp > 35 || rain > 2 || uvi > 7 || aqi > 3) {
      status = "unsafe";
      message += "<br><br><strong>🚫 Not safe to exercise outdoors.</strong>";
    } else if (uvi > 5 || aqi === 3) {
      status = "caution";
      message += "<br><br><strong>⚠️ Caution advised. Use sun protection or mask.</strong>";
    } else {
      message += "<br><br><strong>✅ Safe to exercise outdoors!</strong>";
    }

    showResult(message, status);
  } catch (err) {
    console.error("Error:", err);
    showResult("Error fetching data. Please try again.", "unsafe");
  }
}

function showResult(msg, status) {
  const result = document.getElementById("result");
  result.className = status;
  result.innerHTML = msg;
}
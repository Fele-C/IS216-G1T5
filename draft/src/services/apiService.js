import axios from 'axios';

// INSERT YOUR API KEYS HERE:
const GOOGLE_WEATHER_API_KEY = 'AIzaSyDowpr_xuUgYE9czDZ3rNjcZjqxgRkNLVU';
const GOOGLE_PLACES_API_KEY = 'AIzaSyCdAB6Z2sTSA41CStyvIQgj5IPa8OiqIFg';
const RAPIDAPI_BMI_KEY = 'cc6fa81db9msh92b2d4cce5184dap1ef0bejsn153aaf0110d9';
const API_NINJAS_KEY = 'OAHR8uB9r7FjiHqqmJ/EtA==e5lc9Gi9HXBBRjOi';

export const apiService = {
  async getWeatherData(_location) {
    try {
      // Use proxy endpoint to avoid CORS issues
      let lat, lng;
      if (typeof _location === 'object' && _location.lat && _location.lng) {
        lat = _location.lat;
        lng = _location.lng;
      } else {
        // fallback to default coordinates (Singapore)
        lat = 1.3521;
        lng = 103.8198;
      }

      // Call proxy endpoint instead of direct API
      const response = await axios.get('/api/weather/current', {
        params: { lat, lng }
      });
      const temperature= response.data.temperature.degrees;
      const feelsLike = response.data.feelsLikeTemperature.degrees;
      const uvIndex = response.data.uvIndex;
      const condition = response.data.weatherCondition.description.text;

      let cautionaryString = "";
      let isOutdoorSafe = true;

      if(condition.includes("rain") || condition.includes("storm") || condition.includes("thunder") || condition.includes("shower")){
        cautionaryString = "Wet weather, stay under shelter";
        isOutdoorSafe = false;
      }else if(uvIndex > 5 || temperature > 32){
        cautionaryString = "Dangerous weather, avoid outdoor activities";
        isOutdoorSafe = false;
      }else if(uvIndex > 2 || temperature > 27){
        cautionaryString = "Safe for outdoor activities, but make sure to stay hydrated and apply sunscreen, beware of heatstroke!";
        isOutdoorSafe = true;
      }else{
        cautionaryString = "A great timming to for some outdoor activities!";
        isOutdoorSafe = true;
      }
      
      
      return {
        // temperature: response.data.temperature.degrees,
        // feelsLike: response.data.feelsLikeTemperature.degrees,
        // uvIndex: response.data.uvIndex,
        // condition: response.data.weatherCondition.description.text,
        // isOutdoorSafe: true

        temperature,
        feelsLike,
        uvIndex,
        condition,
        isOutdoorSafe
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  },
  async getWeatherDataNew(location) {
    try {
      const lat = location?.lat || 1.3521;
      const lng = location?.lng || 103.8198;

      // ⚠️ If calling Google directly, note: this may fail in browser due to CORS
      const url = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${GOOGLE_WEATHER_API_KEY}&location.latitude=${lat}&location.longitude=${lng}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (!data?.forecastDays) {
        console.warn('⚠️ No forecastDays found in API response:', data);
        return null;
      }

      // Map forecast to ISO date keys
      const forecastMap = {};
      data.forecastDays.forEach((day) => {
        const { year, month, day: dayOfMonth } = day.displayDate;
        const date = new Date(year, month - 1, dayOfMonth);
        const dateKey = date.toISOString().split('T')[0];

        // const temp = day.maxTemperature?.degrees || day.temperature?.max || 28;
        // const uv = day.maxUvIndex || day.uv || 4;
        // const conditions = day.conditionCode || day.condition || 'Sunny';
        // ✅ FIXED extraction for new Google Weather API structure
        const temp =
        day.daytimeForecast?.temperature?.value ||
        day.daytimeForecast?.apparentTemperature?.value ||
        28;

        const uv =
        day.daytimeForecast?.uvIndex ??
        day.nighttimeForecast?.uvIndex ??
        4;

        const conditions =
        day.daytimeForecast?.weatherCondition?.description?.text ||
        day.nighttimeForecast?.weatherCondition?.description?.text ||
        'Sunny';


        // Determine safety
        let isOutdoorSafe = true;
        let weatherWarning = 'Great weather for outdoor activities!';
        const conditionText = (conditions || '').toLowerCase();

        if (conditionText.includes('rain') || conditionText.includes('storm') ||
            conditionText.includes('thunder') || conditionText.includes('shower')) {
          isOutdoorSafe = false;
          weatherWarning = 'Wet weather expected, stay under shelter';
        } else if ((uv && uv > 5) || (temp && temp > 32)) {
          isOutdoorSafe = false;
          weatherWarning = 'Dangerous weather expected, avoid outdoor activities';
        } else if ((uv && uv > 2) || (temp && temp > 27)) {
          weatherWarning = 'Safe for outdoor activities, but stay hydrated and apply sunscreen';
        }

        forecastMap[dateKey] = {
          // temp,
          // uv,
          uvIndex: uv,
          temperature: temp,
          condition: conditions,
          // conditions,
          isOutdoorSafe,
          weatherWarning,
          fullForecast: day
        };
      });

      // ✅ Return the entire forecast map, not just one day
      return forecastMap;

    } catch (error) {
      console.error('❌ Error fetching weather:', error);
      return null;
    }
  },
  async getWeatherForecast(_location, dates) {
    try {
      console.log('🌤️ getWeatherForecast called with:', { location: _location, dates });
      
      // Get location coordinates
      let lat, lng;
      if (typeof _location === 'object' && _location.lat && _location.lng) {
        lat = _location.lat;
        lng = _location.lng;
        console.log('📍 Using provided coordinates:', { lat, lng });
      } else {
        // Default to Singapore coordinates
        lat = 1.3521;
        lng = 103.8198;
        console.log('📍 Using default coordinates (Singapore):', { lat, lng });
      }

      // Calculate number of days needed (up to 10 days max for Google Weather API)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find the maximum date in the dates array
      const maxDate = dates.reduce((max, date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d > max ? d : max;
      }, today);
      
      // Calculate days difference
      const daysDiff = Math.ceil((maxDate - today) / (1000 * 60 * 60 * 24));
      const daysToFetch = Math.min(Math.max(daysDiff, 1), 10);
      
      console.log('📅 Date calculation:', {
        today: today.toISOString().split('T')[0],
        maxDate: maxDate.toISOString().split('T')[0],
        daysDiff,
        daysToFetch,
        requestedDates: dates.map(d => new Date(d).toISOString().split('T')[0])
      });

      // Fetch daily forecast using proxy endpoint to avoid CORS issues
      console.log('🔗 Fetching forecast via proxy:', { lat, lng, daysToFetch });
      
      const response = await axios.get('/api/weather/forecast', {
        params: { lat, lng, days: daysToFetch }
      });
      
      console.log('📡 API Response received:', {
        status: response.status,
        dataKeys: Object.keys(response.data || {}),
        fullResponse: response.data
      });
      
      // Handle different possible response structures
      let forecastDays = null;
      if (response.data?.dailyForecast?.days) {
        forecastDays = response.data.dailyForecast.days;
        console.log('✅ Found forecast days in response.data.dailyForecast.days');
      } else if (response.data?.days) {
        forecastDays = response.data.days;
        console.log('✅ Found forecast days in response.data.days');
      } else if (Array.isArray(response.data)) {
        forecastDays = response.data;
        console.log('✅ Found forecast days as array in response.data');
      } else {
        console.error('❌ Invalid forecast response structure:', response.data);
        return null;
      }
      
      console.log(`📊 Total forecast days received: ${forecastDays.length}`);
      
      // Map forecasts to requested dates
      const forecastMap = {};
      
      forecastDays.forEach((forecastDay, index) => {
        console.log(`\n🔍 Processing forecast day ${index + 1}:`, forecastDay);
        // Parse the forecast date - handle different possible date field names
        const dateValue = forecastDay.date || forecastDay.dateValue || forecastDay.startDate;
        if (!dateValue) {
          console.warn('⚠️ Forecast day missing date field:', forecastDay);
          return;
        }
        
        console.log(`   📆 Date value found: ${dateValue}`);
        
        const forecastDate = new Date(dateValue);
        if (isNaN(forecastDate.getTime())) {
          console.warn('⚠️ Invalid forecast date:', dateValue);
          return;
        }
        forecastDate.setHours(0, 0, 0, 0);
        console.log(`   📆 Parsed forecast date: ${forecastDate.toISOString().split('T')[0]}`);
        
        // Check if this forecast matches any requested date
        dates.forEach((requestedDate, reqIndex) => {
          const reqDate = new Date(requestedDate);
          if (isNaN(reqDate.getTime())) {
            console.warn(`⚠️ Invalid requested date ${reqIndex}:`, requestedDate);
            return;
          }
          reqDate.setHours(0, 0, 0, 0);
          
          const reqDateStr = reqDate.toISOString().split('T')[0];
          const forecastDateStr = forecastDate.toISOString().split('T')[0];
          
          console.log(`   🔄 Comparing: requested ${reqDateStr} vs forecast ${forecastDateStr}`);
          
          if (forecastDate.getTime() === reqDate.getTime()) {
            console.log(`   ✅ Date match found! Processing weather data...`);
            
            // Extract relevant weather data - handle different possible structures
            const dayForecast = forecastDay.dayForecast || forecastDay.day || forecastDay;
            console.log(`   📦 Day forecast object:`, dayForecast);
            
            const temperature = dayForecast?.maxTemperature?.degrees || 
                               dayForecast?.maxTemp?.degrees || 
                               dayForecast?.temperature?.max || 
                               dayForecast?.high || null;
            const condition = dayForecast?.conditionCode || 
                             dayForecast?.condition || 
                             dayForecast?.weatherCondition?.text ||
                             'Unknown';
            const uvIndex = dayForecast?.maxUvIndex || 
                          dayForecast?.uvIndex || 
                          dayForecast?.uv || null;
            
            console.log(`   🌡️ Extracted weather data:`, {
              temperature,
              condition,
              uvIndex
            });
            
            // Determine if outdoor safe using similar logic as current conditions
            let isOutdoorSafe = true;
            let weatherWarning = null;
            
            const conditionText = condition.toLowerCase();
            console.log(`   🔍 Analyzing weather safety (condition: "${conditionText}", temp: ${temperature}, UV: ${uvIndex})`);
            
            if (conditionText.includes("rain") || conditionText.includes("storm") || 
                conditionText.includes("thunder") || conditionText.includes("shower")) {
              weatherWarning = "Wet weather expected, stay under shelter";
              isOutdoorSafe = false;
              console.log(`   ⛈️ Weather unsafe: Rain/storm detected`);
            } else if ((uvIndex && uvIndex > 5) || (temperature && temperature > 32)) {
              weatherWarning = "Dangerous weather expected, avoid outdoor activities";
              isOutdoorSafe = false;
              console.log(`   ☀️ Weather unsafe: High UV (${uvIndex}) or temperature (${temperature}°C)`);
            } else if ((uvIndex && uvIndex > 2) || (temperature && temperature > 27)) {
              weatherWarning = "Safe for outdoor activities, but stay hydrated and apply sunscreen";
              isOutdoorSafe = true;
              console.log(`   ⚠️ Weather moderate: UV ${uvIndex} or temp ${temperature}°C - caution advised`);
            } else {
              weatherWarning = "Great weather for outdoor activities!";
              isOutdoorSafe = true;
              console.log(`   ✅ Weather safe: Good conditions for outdoor activities`);
            }
            
            const minTemperature = dayForecast?.minTemperature?.degrees || 
                                   dayForecast?.minTemp?.degrees || 
                                   dayForecast?.temperature?.min || 
                                   dayForecast?.low || null;

            const forecastEntry = {
              date: requestedDate,
              temperature,
              condition,
              uvIndex,
              isOutdoorSafe,
              weatherWarning,
              minTemperature,
              fullForecast: forecastDay
            };
            
            forecastMap[requestedDate.toISOString().split('T')[0]] = forecastEntry;
            console.log(`   ✅ Added forecast entry for ${reqDateStr}:`, forecastEntry);
          } else {
            console.log(`   ❌ Date mismatch - skipping`);
          }
        });
      });

      console.log('\n📋 Final forecast map:', forecastMap);
      console.log(`✅ Returning ${Object.keys(forecastMap).length} forecast entries`);
      
      return forecastMap;
    } catch (error) {
      console.error('❌ Frontend: Error fetching weather forecast:', error);
      if (error.response) {
        console.error('  Response status:', error.response.status);
        console.error('  Response data:', error.response.data);
        console.error('  API Error details:', error.response.data?.apiError);
      }
      return null;
    }
  },

  

  async getNearbyPlaces(lat, lng, radiusKm = 5, type = 'park') {
    try {
      // Use relative path - Firebase Hosting will route to the Cloud Function
      // For local dev, use Firebase emulator or set up Vite proxy
      const response = await axios.get('/api/nearby-places', {
        params: {
          lat,
          lng,
          radius: radiusKm * 1000,
          type,
        },
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return [];
    }
  },


  



  async calculateBMI(weight, height, age, gender) {
    try {
      // Map gender to API format ('m' or 'f')
      let sex = 'm';
      if (gender === 'female') {
        sex = 'f';
      } else if (gender === 'male') {
        sex = 'm';
      } else {
        sex = 'm'; // default to male
      }

      const options = {
        method: 'POST',
        url: 'https://bmi.p.rapidapi.com/v1/bmi',
        headers: {
          'x-rapidapi-key': RAPIDAPI_BMI_KEY,
          'x-rapidapi-host': 'bmi.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
          weight: {
            value: weight.toString(),
            unit: 'kg'
          },
          height: {
            value: height.toString(),
            unit: 'cm'
          },
          sex: sex,
          age: age.toString()
        }
      };

      const response = await axios.request(options);
      console.log('BMI API Response:', response.data);
      
      // Extract data from API response
      const apiData = response.data;
      
      return {
        bmi: parseFloat(apiData.bmi) || 0,
        bmr: parseFloat(apiData.bmr) || 0,
        category: apiData.health || 'Unknown',
        idealWeight: apiData.ideal_weight || null,
        apiData: apiData
      };
    } catch (error) {
      console.error('Error calling BMI API:', error.response?.data || error.message);
      // Fallback to local calculation if API fails
      const bmi = weight / Math.pow(height / 100, 2);
      return {
        bmi: parseFloat(bmi.toFixed(2)),
        bmr: 0,
        category: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese',
        idealWeight: null
      };
    }
  },

  async getCaloriesBurnt(_activity, duration, weight) {
    try {
      // INSERT API NINJAS CALORIES BURNT CALCULATION HERE
      // Example: const response = await axios.get(`https://api.api-ninjas.com/v1/caloriesburned`, {
      //   params: { activity, duration, weight },
      //   headers: { 'X-Api-Key': API_NINJAS_KEY }
      // });

      const response = await axios.get(`https://api.api-ninjas.com/v1/caloriesburned`, {
      params: {
        activity: _activity,
        duration: duration,
        weight: weight 
      },
      headers: { 'X-Api-Key': API_NINJAS_KEY }
      });

      // const baseCaloriesPerMinute = (response.data[0].calories_per_hour)/60;
      // return Math.round(baseCaloriesPerMinute * duration * (weight / 70));
      const calories_burnt = response.data[0].total_calories;
      const calories_burnt_per_hour = response.data[0].calories_per_hour;
      return{
        calories_burnt,
        calories_burnt_per_hour

      }
    } catch (error) {
      console.error('Error calculating calories burnt:', error);
      return 0;
    }
  },

  async getRecommendedActivities(weather, _goal, isOutdoor) {
    const activities = [
      { name: 'Running', type: 'outdoor', caloriesPerHour: 600, weatherSafe: ['Sunny', 'Cloudy'] },
      { name: 'Cycling', type: 'outdoor', caloriesPerHour: 500, weatherSafe: ['Sunny', 'Cloudy'] },
      { name: 'Swimming', type: 'indoor', caloriesPerHour: 450, weatherSafe: ['All'] },
      { name: 'Yoga', type: 'indoor', caloriesPerHour: 200, weatherSafe: ['All'] },
      { name: 'Weight Training', type: 'indoor', caloriesPerHour: 400, weatherSafe: ['All'] },
      { name: 'Walking', type: 'outdoor', caloriesPerHour: 300, weatherSafe: ['Sunny', 'Cloudy'] },
      { name: 'Dancing', type: 'indoor', caloriesPerHour: 350, weatherSafe: ['All'] },
      { name: 'Hiking', type: 'outdoor', caloriesPerHour: 550, weatherSafe: ['Sunny', 'Cloudy'] }
    ];


    // return activities.filter(activity => {
    //   if (isOutdoor && activity.type !== 'outdoor') return false;
    //   if (!isOutdoor && activity.type !== 'indoor') return false;
    //   if (weather && !activity.weatherSafe.includes('All') && !activity.weatherSafe.includes(weather.condition)) {
    //     return false;
    //   }

    //   if(isOutdoor)

    //   return true;
    // });

    if(isOutdoor){
      return activities;
    }
    // return [];
    return activities;

    
  }
};
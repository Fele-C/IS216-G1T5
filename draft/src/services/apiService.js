import axios from 'axios';

// INSERT YOUR API KEYS HERE:
const GOOGLE_WEATHER_API_KEY = 'AIzaSyDowpr_xuUgYE9czDZ3rNjcZjqxgRkNLVU';
// const GOOGLE_PLACES_API_KEY = '';
const RAPIDAPI_BMI_KEY = 'cc6fa81db9msh92b2d4cce5184dap1ef0bejsn153aaf0110d9';
// const API_NINJAS_KEY = '';

export const apiService = {
  async getWeatherData(_location) {
    try {
      // INSERT GOOGLE WEATHER API CALL HERE
      // Example: 
      // const response = await axios.get(`https://api.google.com/weather?location=${location}&key=${GOOGLE_WEATHER_API_KEY}`);

      const response = await axios.get(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_WEATHER_API_KEY}&location.latitude=1.3521&location.longitude=103.8198`);
      return {
        temperature: response.data.temperature.degrees,
        feelsLike: response.data.feelsLikeTemperature.degrees,
        uvIndex: response.data.uvIndex,
        condition: response.data.weatherCondition.description.text,
        isOutdoorSafe: true
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  },

  async getNearbyPlaces(_location, _maxDistance, _activityType) {
    try {
      // INSERT GOOGLE PLACES API CALL HERE
      // Example: const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${maxDistance}&type=${activityType}&key=${GOOGLE_PLACES_API_KEY}`);

      return [
        {
          name: 'Central Park',
          location: 'Downtown',
          price: '$$',
          crowdLevel: 'Medium',
          distance: 2.5
        }
      ];
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

      const baseCaloriesPerMinute = 5;
      return Math.round(baseCaloriesPerMinute * duration * (weight / 70));
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

    return activities.filter(activity => {
      if (isOutdoor && activity.type !== 'outdoor') return false;
      if (!isOutdoor && activity.type !== 'indoor') return false;
      if (weather && !activity.weatherSafe.includes('All') && !activity.weatherSafe.includes(weather.condition)) {
        return false;
      }
      return true;
    });
  }
};


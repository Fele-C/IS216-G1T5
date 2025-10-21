// INSERT YOUR API KEYS HERE:
const GOOGLE_WEATHER_API_KEY = 'AIzaSyDowpr_xuUgYE9czDZ3rNjcZjqxgRkNLVU';
// const GOOGLE_PLACES_API_KEY = '';
// const RAPIDAPI_BMI_KEY = '';
// const API_NINJAS_KEY = '';

export const apiService = {
  async getWeatherData(_location: string) {
    try {
      // INSERT GOOGLE WEATHER API CALL HERE
      // Example: 
      // const response = await axios.get(`https://api.google.com/weather?location=${location}&key=${GOOGLE_WEATHER_API_KEY}`);

      return {
        temperature: 25,
        uvIndex: 5,
        condition: 'Sunny',
        isOutdoorSafe: true
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  },

  async getNearbyPlaces(_location: string, _maxDistance: number, _activityType: string) {
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

  async calculateBMI(weight: number, height: number) {
    try {
      // INSERT RAPIDAPI BMI CALCULATION HERE
      // Example using RapidAPI BMI Calculator endpoint
      // const response = await axios.get(`https://bmi-calculator-api.p.rapidapi.com/calculate`, {
      //   params: { weight_kg: weight, height_cm: height },
      //   headers: {
      //     'X-RapidAPI-Key': RAPIDAPI_BMI_KEY,
      //     'X-RapidAPI-Host': 'bmi-calculator-api.p.rapidapi.com'
      //   }
      // });

      const bmi = weight / Math.pow(height / 100, 2);
      return {
        bmi: parseFloat(bmi.toFixed(2)),
        category: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
      };
    } catch (error) {
      console.error('Error calculating BMI:', error);
      return null;
    }
  },

  async getCaloriesBurnt(_activity: string, duration: number, weight: number) {
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

  async getRecommendedActivities(weather: any, _goal: string, isOutdoor: boolean) {
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

import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json()); // Add JSON body parsing

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in km
  }
  

// Weather API endpoints
const GOOGLE_WEATHER_API_KEY = process.env.GOOGLE_WEATHER_API_KEY || 'AIzaSyDowpr_xuUgYE9czDZ3rNjcZjqxgRkNLVU';

// Current weather conditions endpoint
app.get('/api/weather/current', async (req, res) => {
  const { lat, lng } = req.query;

  // Default to Singapore if no coordinates provided
  const latitude = lat || '1.3521';
  const longitude = lng || '103.8198';

  try {
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_WEATHER_API_KEY}&location.latitude=${latitude}&location.longitude=${longitude}`;
    
    console.log('🌡️ Server: Fetching current weather from:', url.replace(GOOGLE_WEATHER_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error('❌ Server: Error fetching current weather:');
    console.error('  Message:', err.message);
    console.error('  Status:', err.response?.status);
    console.error('  Response Data:', err.response?.data);
    
    res.status(500).json({ 
      error: 'Failed to fetch current weather', 
      details: err.message,
      apiError: err.response?.data || null
    });
  }
});

// Weather forecast endpoint
app.get('/api/weather/forecast', async (req, res) => {
  const { lat, lng, days } = req.query;

  // Default to Singapore if no coordinates provided
  const latitude = lat || '1.3521';
  const longitude = lng || '103.8198';
  const daysToFetch = days || '10';

  try {
    // Google Weather API uses POST with JSON body
    // The endpoint format is: https://weather.googleapis.com/v1/forecast.days:lookup
    const url = `https://weather.googleapis.com/v1/forecast.days:lookup?key=${GOOGLE_WEATHER_API_KEY}`;
    
    const requestBody = {
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      days: parseInt(daysToFetch)
    };
    
    console.log('🌤️ Server: Fetching forecast via POST to:', url.replace(GOOGLE_WEATHER_API_KEY, 'API_KEY_HIDDEN'));
    console.log('  Request body:', JSON.stringify(requestBody, null, 2));
    
    // Google Weather API requires POST request
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Server: Forecast response received:', {
      status: response.status,
      dataKeys: Object.keys(response.data || {}),
      hasData: !!response.data,
      responseStructure: response.data ? Object.keys(response.data) : 'No data'
    });
    
    // Log the full response structure for debugging
    if (response.data) {
      console.log('  Full response structure:', JSON.stringify(response.data, null, 2).substring(0, 500));
    }
    
    res.json(response.data);
  } catch (err) {
    console.error('❌ Server: Error fetching weather forecast:');
    console.error('  Message:', err.message);
    console.error('  Status:', err.response?.status);
    console.error('  Status Text:', err.response?.statusText);
    
    // Log the error response more clearly
    if (err.response?.data) {
      if (typeof err.response.data === 'string') {
        console.error('  Response Data (HTML):', err.response.data.substring(0, 500));
      } else {
        console.error('  Response Data (JSON):', JSON.stringify(err.response.data, null, 2));
      }
    }
    
    // Check if it's a 404 - might indicate wrong endpoint or API not enabled
    if (err.response?.status === 404) {
      console.error('  ⚠️ 404 Error - Possible causes:');
      console.error('    1. Weather API not enabled for this API key');
      console.error('    2. Wrong endpoint URL');
      console.error('    3. API key doesn\'t have access to Weather API');
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch weather forecast', 
      details: err.message,
      apiError: err.response?.data || null,
      status: err.response?.status || null,
      suggestion: err.response?.status === 404 ? 'Check if Weather API is enabled in Google Cloud Console' : null
    });
  }
});

app.get('/api/nearby-places', async (req, res) => {
  const { lat, lng, radius = 5000, type = 'park' } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat or lng query parameters' });
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: `${lat},${lng}`,
          radius,
          type,
          key: process.env.GOOGLE_PLACES_API_KEY, 
        },
      }
    );

    const places = response.data.results.map(place => {
        const placeLat = place.geometry.location.lat;
        const placeLng = place.geometry.location.lng;
  
        return {
          name: place.name,
          location: place.vicinity,
          distanceKm: getDistanceFromLatLonInKm(
            parseFloat(lat),
            parseFloat(lng),
            placeLat,
            placeLng
          ).toFixed(2) 
        };
    });



    res.json(places);
  } catch (err) {
    console.error('Error fetching nearby places:', err.message);
    res.status(500).json({ error: 'Failed to fetch nearby places' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

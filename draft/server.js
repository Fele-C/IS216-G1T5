import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());

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

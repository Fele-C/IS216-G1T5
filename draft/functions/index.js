/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const axios = require("axios");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Helper function to calculate distance between two coordinates
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

// Nearby Places API endpoint
exports.nearbyPlaces = onRequest((request, response) => {
  // Enable CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  const { lat, lng, radius = 5000, type = 'park' } = request.query;

  if (!lat || !lng) {
    return response.status(400).json({ error: 'Missing lat or lng query parameters' });
  }

  // Get API key from environment variables (Firebase Functions v2)
  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyCdAB6Z2sTSA41CStyvIQgj5IPa8OiqIFg';

  axios.get(
    'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
    {
      params: {
        location: `${lat},${lng}`,
        radius,
        type,
        key: GOOGLE_PLACES_API_KEY,
      },
    }
  )
    .then((apiResponse) => {
      const places = apiResponse.data.results.map(place => {
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

      response.json(places);
    })
    .catch((err) => {
      logger.error('Error fetching nearby places:', err.message);
      response.status(500).json({ error: 'Failed to fetch nearby places' });
    });
});

// Legacy helloWorld function (can be removed if not needed)
exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

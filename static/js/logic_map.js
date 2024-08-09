// Define layers
let lightLayer = L.layerGroup();
let sphereLayer = L.layerGroup();
let circleLayer = L.layerGroup();
let unknownLayer = L.layerGroup();
let cylinderLayer = L.layerGroup();
let cigarLayer = L.layerGroup();
let diskLayer = L.layerGroup();
let triangleLayer = L.layerGroup();
let otherLayer = L.layerGroup();
let fireballLayer = L.layerGroup();
let orbLayer = L.layerGroup();
let chevronLayer = L.layerGroup();
let coneLayer = L.layerGroup();
let ovalLayer = L.layerGroup();
let diamondLayer = L.layerGroup();
let starLayer = L.layerGroup();
let changingLayer = L.layerGroup();
let eggLayer = L.layerGroup();
let crossLayer = L.layerGroup();
let formationLayer = L.layerGroup();
let flashLayer = L.layerGroup();
let rectangleLayer = L.layerGroup();
let teardropLayer = L.layerGroup();
let defaultLayer = L.layerGroup();
let allLayers = L.layerGroup();

// Define Overlays
let overlays = {
    "Select All": allLayers,
    "Light Shape": lightLayer,
    "Sphere Shape": sphereLayer,
    "Circle Shape": circleLayer,
    "Unknown Shape": unknownLayer,
    "Cylinder Shape": cylinderLayer,
    "Cigar Shape": cigarLayer,
    "Disk Shape": diskLayer,
    "Triangle Shape": triangleLayer,
    "Other Shape": otherLayer,
    "Fireball Shape": fireballLayer,
    "Orb Shape": orbLayer,
    "Chevron Shape": chevronLayer,
    "Cone Shape": coneLayer,
    "Oval Shape": ovalLayer,
    "Diamond Shape": diamondLayer,
    "Star Shape": starLayer,
    "Changing Shape": changingLayer,
    "Egg Shape": eggLayer,
    "Cross Shape": crossLayer,
    "Formation Shape": formationLayer,
    "Flash Shape": flashLayer,
    "Rectangle Shape": rectangleLayer,
    "Teardrop Shape": teardropLayer,
    "Sightings Per City": defaultLayer
};

// Set a personalized icon with an image from the web
const pinIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/10928/10928949.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// Define tile layers
let grayscaleLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZGduYW1lIiwiYSI6ImNseDk3djltdDJvZWYybHBvZm8ycDNjYmgifQ.MVi4dHGFLb5Du360HqicFA'
});

let outdoorsLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
    id: 'mapbox/outdoors-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZGduYW1lIiwiYSI6ImNseDk3djltdDJvZWYybHBvZm8ycDNjYmgifQ.MVi4dHGFLb5Du360HqicFA'
});

let satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZGduYW1lIiwiYSI6ImNseDk3djltdDJvZWYybHBvZm8ycDNjYmgifQ.MVi4dHGFLb5Du360HqicFA'
});

// Adding layers control
let baseLayers = {
    "Grayscale Map": grayscaleLayer,
    "Outdoors Map": outdoorsLayer,
    "Satellite Map": satelliteLayer
};

// Creating the map object
let myMap = L.map("map", {
    center: [23.634501, -102.552784],
    zoom: 5,
    layers: [satelliteLayer] // Setting satellite layer as default
});

L.control.layers(baseLayers, overlays).addTo(myMap);

// Define a larger icon size for markers
const markerSize = 15;

// Create an empty object to store sightings counts by city
let sightingsByCity = {};

// Fetch GeoJSON data for UFO sightings
d3.json('/api').then(function(data) {
    // Check if data is valid and in the correct format
    if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format');
    }

    // Object to store sightings grouped by city and coordinates
    let sightingsByCity = {};

    // Process each sighting in the data
    data.forEach(function(sighting) {
        const { Lat, Lng, Shape, City, Summary, Link } = sighting;

            // Create a unique key for each city's coordinates
            let cityKey = `${City}-${Lat}-${Lng}`;

            // Initialize the city's entry if it doesn't exist
            if (!sightingsByCity[cityKey]) {
                sightingsByCity[cityKey] = {
                    count: 0,
                    lat: Lat,
                    lng: Lng,
                    city: City
                };
            }

            // Increment the count for this city's coordinates
            sightingsByCity[cityKey].count += 1;

            // Create a circle marker for the sighting
            const marker = L.marker([Lat, Lng], {
                icon: pinIcon 
            }).bindPopup(`
                <strong>Shape:</strong> ${Shape}<br>
                <strong>Location:</strong> ${City}<br>
                <strong>Summary:</strong> ${Summary}<br>
                <a href="${Link}" target="_blank">More Information</a>
            `);

            // Add the marker to the appropriate layer based on UFO shape
            const shapeLayerKey = `${Shape} Shape`;
            if (shapeLayerKey in overlays) {
                overlays[shapeLayerKey].addLayer(marker);
            }

            // Add the marker to a general layer for all sightings
            allLayers.addLayer(marker);
        } 
    );

    // Create markers for each city with the count of sightings
    Object.keys(sightingsByCity).forEach(cityKey => {
        const cityData = sightingsByCity[cityKey];
        
        // Calculate the radius based on the number of sightings (e.g., multiply by 4 for scaling)
        const radius = getRadius(cityData.count / 2);

        // Create a circle marker for the city
        const cityMarker = L.circleMarker([cityData.lat, cityData.lng], {
            radius: radius,
            fillColor: "yellow",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<strong>City:</strong> ${cityData.city}<br>
                      <strong>Number of Sightings:</strong> ${cityData.count}`);

        // Add this marker to the default layer or any other layer you prefer
        defaultLayer.addLayer(cityMarker);
        allLayers.addLayer(cityMarker);
    });

}).catch(function(error) {
    console.error('Error fetching or processing GeoJSON data:', error);
});

// Function to get marker radius based on the count of sightings
function getRadius(sightings) {
    return sightings ? sightings * 4 : 1; // Adjust the multiplier for appropriate scaling
}

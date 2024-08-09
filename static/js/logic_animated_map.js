// Define the animated map
let animatedMap = L.map("animatedMap", {
    center: [23.634501, -102.552784],
    zoom: 5,
    layers: [L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
        id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiZGduYW1lIiwiYSI6ImNseDk3djltdDJvZWYybHBvZm8ycDNjYmgifQ.MVi4dHGFLb5Du360HqicFA'
    })]
});

let years = [];
let yearIndex = 0;
let interval = null;

// Custom icon for the animated map
const animatedMapIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/10928/10928949.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// Create a control for displaying the year
const yearControl = L.control({ position: 'bottomright' });

yearControl.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'year-control');
    this.update();
    return this._div;
};

yearControl.update = function(year) {
    this._div.innerHTML = `<strong>Year:</strong> ${year || ''}`;
};

yearControl.addTo(animatedMap);

// Load the UFO sighting data
d3.json('/api').then(function(data) {
    if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format');
    }

    // Log data to debug
    console.log("Loaded data:", data);

    // Extract years and sort them
    years = [...new Set(data.map(sighting => new Date(sighting.Occurred).getFullYear()))].sort((a, b) => a - b);
    console.log("Years:", years);

    // Function to update the map for a given year
    function updateMapForYear(year) {
        console.log("Updating map for year:", year);

        // Update the year display
        yearControl.update(year);

        // Clear previous layers
        animatedMap.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                animatedMap.removeLayer(layer);
            }
        });

        // Filter data for the current year
        const sightingsForYear = data.filter(sighting => new Date(sighting.Occurred).getFullYear() === year);
        console.log(`Sightings for ${year}:`, sightingsForYear);

        // Transform data to GeoJSON format
        const geojsonFeatures = sightingsForYear.map(sighting => ({
            type: "Feature",
            properties: {
                date: sighting.Occurred,
                shape: sighting.Shape,
                city: sighting.City,
                state: sighting.State_x,
                summary: sighting.Summary,
                url: sighting.Link
            },
            geometry: {
                type: "Point",
                coordinates: [sighting.Lng, sighting.Lat]
            }
        }));

        const geojsonData = {
            type: "FeatureCollection",
            features: geojsonFeatures
        };

        // Add new markers for the current year
        L.geoJSON(geojsonData, {
            pointToLayer: function (feature, latlng) {
                console.log(`Adding marker at ${latlng} for sighting:`, feature);
                return L.marker(latlng, { icon: animatedMapIcon }).bindPopup(`<strong>Date:</strong> ${feature.properties.date}<br>
                                                                              <strong>Shape:</strong> ${feature.properties.shape}<br>
                                                                              <strong>City:</strong> ${feature.properties.city}<br>
                                                                              <strong>State:</strong> ${feature.properties.state}<br>
                                                                              <strong>Summary:</strong> ${feature.properties.summary}<br>
                                                                              <a href="${feature.properties.url}" target="_blank">More Information</a>`);
            }
        }).addTo(animatedMap);
    }

    // Function to animate through the years
    function animateYears() {
        if (interval) clearInterval(interval);

        interval = setInterval(() => {
            updateMapForYear(years[yearIndex]);
            yearIndex = (yearIndex + 1) % years.length;
        }, 1000); // 1 second per year
    }

    // Start the animation
    animateYears();
}).catch(function(error) {
    console.error('Error fetching or processing UFO sighting data:', error);
});

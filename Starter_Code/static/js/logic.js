// Initialize the map centered on a specific location
const map = L.map('map').setView([37.09, -95.71], 5);

// Add the OpenStreetMap tile layer (base map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Function to determine the color of a marker based on earthquake depth
const getColor = (depth) => {
    return depth > 90 ? '#7f0000' :  // Dark Red
           depth > 70 ? '#990000' :  // Deep Red
           depth > 50 ? '#cc3333' :  // Medium Red
           depth > 30 ? '#ff6666' :  // Light Red
           depth > 10 ? '#ff9999' :  // Very Light Red
                        '#ffcccc';  // Pale Red
};

// Function to calculate the marker radius based on earthquake magnitude
const getRadius = (magnitude) => magnitude * 4;

// Fetch earthquake data from the USGS GeoJSON feed
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then((data) => {
    // Add the earthquake data to the map as circle markers
    L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
                radius: getRadius(feature.properties.mag),
                fillColor: getColor(feature.geometry.coordinates[2]), // Color based on depth
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        // Attach popups to each marker
        onEachFeature: (feature, layer) => {
            const { place, mag } = feature.properties;
            const depth = feature.geometry.coordinates[2];
            layer.bindPopup(`
                <h3>${place}</h3>
                <hr>
                <p>Magnitude: ${mag}<br>Depth: ${depth} km</p>
            `);
        }
    }).addTo(map);
});

// Create a legend control to describe depth intervals
const legend = L.control({ position: 'bottomright' });

legend.onAdd = (map) => {
    const div = L.DomUtil.create('div', 'info legend');
    const depthGrades = [0, 10, 30, 50, 70, 90];
    
    // Generate legend labels with corresponding colors
    depthGrades.forEach((grade, i) => {
        div.innerHTML += `
            <i style="background: ${getColor(grade + 1)}"></i> 
            ${grade}${depthGrades[i + 1] ? `&ndash;${depthGrades[i + 1]}<br>` : '+'}
        `;
    });

    return div;
};

// Add the legend to the map
legend.addTo(map);

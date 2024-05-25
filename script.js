// Load the map
const map = L.map('map').setView([20.5937, 78.9629], 5);

// Load and display tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load CSV data and GeoJSON data
Promise.all([
    d3.csv('data/constituencies.csv'),
    d3.json('data/indian_constituencies.geojson')
]).then(([csvData, geoJsonData]) => {
    // Merge CSV data with GeoJSON
    geoJsonData.features.forEach(feature => {
        const pcName = feature.properties.PC_NAME;
        const constituencyData = csvData.find(d => d['PC Name'] === pcName);
        if (constituencyData) {
            feature.properties = { ...feature.properties, ...constituencyData };
        }
    });

    // Function to get color based on value
    function getColor(value) {
        return value > 75 ? '#800026' :
               value > 50 ? '#BD0026' :
               value > 25 ? '#E31A1C' :
                            '#FFEDA0';
    }

    // Function to style each feature
    function style(feature) {
        return {
            fillColor: getColor(feature.properties[selectedMetric]),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    // Create a layer and add to map
    let geoJsonLayer = L.geoJson(geoJsonData, { style }).addTo(map);

    // Update map with selected metric
    function updateMap(metric) {
        geoJsonLayer.eachLayer(layer => {
            layer.setStyle({
                fillColor: getColor(layer.feature.properties[metric])
            });
        });
    }

    // Add event listener for filter change
    document.getElementById('filter').addEventListener('change', (event) => {
        selectedMetric = event.target.value;
        updateMap(selectedMetric);
    });

    // Set default metric
    let selectedMetric = 'Votes';
    updateMap(selectedMetric);
});
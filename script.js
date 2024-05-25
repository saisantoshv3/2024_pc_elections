// Set dimensions and margins for the map
const width = 960;
const height = 600;

// Create an SVG element and append it to the body
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

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

    // Create a projection
    const projection = d3.geoMercator()
        .fitSize([width, height], geoJsonData);

    // Create a path generator
    const path = d3.geoPath()
        .projection(projection);

    // Function to get color based on value
    function getColor(value) {
        return value > 75 ? '#800026' :
               value > 50 ? '#BD0026' :
               value > 25 ? '#E31A1C' :
                            '#FFEDA0';
    }

    // Draw the map
    svg.selectAll("path")
        .data(geoJsonData.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", d => getColor(+d.properties[selectedMetric]))
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "#ff0000");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", getColor(+d.properties[selectedMetric]));
        });

    // Update map with selected metric
    function updateMap(metric) {
        svg.selectAll("path")
            .transition()
            .duration(500)
            .attr("fill", d => getColor(+d.properties[metric]));
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
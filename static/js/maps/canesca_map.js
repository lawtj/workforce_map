export function createCANESCAmap(cancountry,canstates,canesca) {
    
    var map = L.map('map').setView([-10, 30], 4);

    var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        opacity: 0.5
    }).addTo(map);

    var countriesStyle = {
        fillColor: 'green',
        color: 'black',
        weight: 2,
        fillOpacity: 0.0,
        dashArray: "5, 5"
    };

    var countriesLayer = L.geoJSON(cancountry, { // Replace 'country' with your GeoJSON data
        style: countriesStyle
    }).addTo(map);

    var boundariesStyle = {
        fillColor: 'blue',
        color: 'purple',
        weight: 0,
        fillOpacity: 0.05
    };

    var boundariesLayer = L.geoJSON(canstates, { // Replace 'states' with your GeoJSON data
        style: boundariesStyle,
        onEachFeature: function (feature, layer) {
            var tooltipContent = '<strong>' + feature.properties.admin + '</strong>' +
                '<br>' + feature.properties.name + ' district';

            layer.bindTooltip(tooltipContent);
        }

    }).addTo(map);

    var markerCluster = L.markerClusterGroup();

    const geojson = L.geoJSON(canesca, {
        onEachFeature: function (feature, layer) {
            // Assuming the feature has properties 'Latitude' and 'Longitude'
            var marker = L.marker([feature.properties['Latitude'], feature.properties['Longitude']]);

            // Build the tooltip content using feature properties
            var tooltipContent = '<strong>' + feature.properties.PRIMARY_ORGANISATION + '</strong>: ' +
                feature.properties.Number_of_Anaesthesiologists + ' anaesthesiologist(s)';

            marker.bindTooltip(tooltipContent);
            markerCluster.addLayer(marker);

        }
    })

    // Add the MarkerClusterGroup to the map
    map.addLayer(markerCluster);
    return map
}
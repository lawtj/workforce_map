export function createMap(papData,isiframe) {
    var mapoption = 'pap';
    var southWest = L.latLng(-90, -180);
    var northEast = L.latLng(90, 180);
    var bounds = L.latLngBounds(southWest, northEast);

    const map = L.map('map',).setView([24.653024159812, 10.732421875000002], 2);

    const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            noWrap: true,
            bounds: bounds,
    }).addTo(map);

    function getColor(value) {
        return value >= 20 ? '#4575b4' :
            value >= 15 ? '#91bfdb' :
                value >= 10 ? '#e0f3f8' :
                    value >= 5 ? '#ffffbf' :
                        value >= 3 ? '#fee090' :
                            value >= 1 ? '#fc8d59' :
                                '#d73027'; // for value < 1
    }

    //style function
    function styleGeo(geojson) {
        if (mapoption === 'gaws'){
            var value = geojson.properties['totalpap_cap'];
        } else {
            var value = geojson.properties['physicians2015_cap'];
        }
        // check if value is null or undefined
        if (value === null || value === undefined || value === "No data") {
            return {
                fillColor: 'black',
                fillOpacity: 0.4,
                color: 'black',
                opacity: 1,
                weight: 1
            };

        }
        return {
            fillColor: getColor(value),
            fillOpacity: .7,
            color: 'black',
            opacity: 1,
            weight: 1
        };

    }

    // Convert Hex to RGBA
    function hexToRGBA(hex, opacity) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    //what to do on highlight
    function highlightGeo(e) {
        var layer = e.target;
        layer.setStyle({
            fillOpacity: 0.5,
            weight: 3
        })
    };

    //what to do on mouseout
    function resetGeo(e) {
        geojson.resetStyle(e.target);
    };
    // Process 'Total PAPs' data
    function extractProperties(feature) {
        const properties = {
            'population': null,
            'totalpap': null,
            'totalpap_cap': null,
            'physicians2015': null,
            'physicians2015_cap': null,
            'totalnpap': null,
            'totalnpap_cap': null,
            'nurses2015': null,
            'nurses2015_cap': null
        };

        for (const prop in properties) {
            if (feature.properties && feature.properties[prop]) {
                var value = parseFloat(feature.properties[prop]);
                if (!isNaN(value)) {
                    if (prop.endsWith('_cap')) { // For per capita values
                        properties[prop] = value.toFixed(2);
                    } else { // For population and total number values
                        properties[prop] = value.toLocaleString();
                    }
                } else {
                    properties[prop] = 'No data';
                }
            } else {
                properties[prop] = 'No data';
            }
        }

        return properties;
    }

    const propertiesToDisplay = {
        'totalpap': 'Total PAPs',
        'totalpap_cap': 'Total PAP Density',
        // Add other properties here
    }

    function onEachFeature(feature, layer) {
        var featureProperties = extractProperties(feature);

        var tooltipContent = '';

        try {

            // Check for and add the country name
            if (feature.properties && feature.properties['NAME']) {
                tooltipContent += '<strong>Country:</strong> ' + feature.properties['NAME'];
            }
            // Loop over each property and add its data
            for (const key in propertiesToDisplay) {
                tooltipContent += `<br><strong>${propertiesToDisplay[key]}:</strong> `;
                var value = featureProperties[key];
                tooltipContent += value;

            }

            // Bind the constructed tooltip content
            layer.bindTooltip(tooltipContent);

            // Event handlers
            layer.on({
                mouseover: highlightGeo,
                mouseout: resetGeo,
                click: function (e) {
                        if (isiframe === false) {
                            
                            document.getElementById('country-name').innerHTML = feature.properties['NAME'];
                            if (featureProperties['population'] === 'No data' || featureProperties['population'] === null || isNaN(featureProperties['population'])) {
                                document.getElementById('country-population').innerHTML = 'Population: No data';
                            } else {
                                document.getElementById('country-population').innerHTML = 'Population: ' + (featureProperties['population'] / 10).toFixed(2) + ' million';
                            }
                            document.getElementById('country-totalpap').innerHTML = featureProperties['totalpap'].toLocaleString();
                            document.getElementById('country-totalpap_cap').innerHTML = featureProperties['totalpap_cap']
                            document.getElementById('country-PAP2015').innerHTML = featureProperties['physicians2015'].toLocaleString();
                            document.getElementById('country-pap_density_2015').innerHTML = featureProperties['physicians2015_cap']
                            document.getElementById('country-totalnpap').innerHTML = featureProperties['totalnpap'].toLocaleString();
                            document.getElementById('country-totalnpap_cap').innerHTML = featureProperties['totalnpap_cap']
                            document.getElementById('country-NPAP2015').innerHTML = featureProperties['nurses2015'].toLocaleString();
                            document.getElementById('country-npap_density_2015').innerHTML = featureProperties['nurses2015_cap']
                            document.getElementById('country-details').style.display = '';
                            if (featureProperties['totalpap_cap'] === 'No data' || featureProperties['totalpap_cap'] === null || isNaN(featureProperties['totalpap_cap'])) {
                                document.getElementById('card-header').style.backgroundColor = hexToRGBA('black', 0.7);
                                document.getElementById('card-header-title').classList.remove('is-size-4')
                            } else {
                                document.getElementById('card-header').style.backgroundColor = hexToRGBA(getColor(featureProperties['totalpap_cap']), 0.7);
                            }
                            document.getElementById('card-header-title').classList.add('is-size-4')
                        } else {
                            console.log('this is an iframe, suppressing clicks')
                        }
                }
            });
        } catch (e) {
            console.log('Error on feature: ', feature.properties);
            console.log('Error: ', e);
        }

    };


    const geojson = L.geoJSON(papData, {
        style: styleGeo,
        onEachFeature: onEachFeature
    }
    ).addTo(map);

    const gaws2015 = L.geoJSON(papData, {
        style: styleGeo,
        onEachFeature: onEachFeature
    }
    ).addTo(map);

    var legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 3, 5, 10, 15, 20],
            labels = [];




        // Generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<span ><i style="background: ' + getColor(grades[i]) + '; width: 18px; height: 18px; display: inline-block;"></i> ' +
                (grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] : '+')) + '</span> ';
        }

        div.innerHTML += '<div class="legend-caption">PAP density per 100,000 population</div>';

        return div;
    };

    legend.addTo(map);
    return map;
}
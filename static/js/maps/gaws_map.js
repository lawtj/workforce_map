console.log("Leaflet L object:", L);
console.log("Is L.latLng a function?", typeof L.latLng === 'function');
console.log("Full L properties:", Object.keys(L));

export function createMap(papData, isiframe, layer) {
    var southWest = L.latLng(-90, -180);
    var northEast = L.latLng(90, 180);
    var bounds = L.latLngBounds(southWest, northEast);

    // // Define the Robinson projection using Proj4
    // var crs = new L.Proj.CRS('EPSG:54030',
    // '+proj=robin +lon_0=0 +datum=WGS84 +units=m +no_defs', {
    //     resolutions: [65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2],
    //     origin: [0, 0],
    //     bounds: L.bounds([-17000000, -8625150], [17000000, 8625150])
    // }
    // );

    // // Initialize the map with the custom CRS
    // const map = L.map('map', {
    // crs: crs,
    // center: [0, 0],
    // zoom: 2,
    // maxZoom: 15,
    // minZoom: 0
    // });


    const map = L.map('map', {attributionControl:false}).setView([24.653024159812, 10.732421875000002], 2);
    const attribution = L.control.attribution().setPrefix("<a href='https://leafletjs.com'>Leaflet</a>").addAttribution('<a href="www.globalanesthesiamaps.com">www.globalanesthesiamaps.com</a>').addTo(map);

    function getColor(value) {
        return value >= 20 ? '#4575b4' :
            value >= 15 ? '#91bfdb' :
                value >= 10 ? '#e0f3f8' :
                    value >= 5 ? '#ffffbf' :
                        value >= 3 ? '#fee090' :
                            value >= 1 ? '#fc8d59' :
                                '#d73027'; // for value < 1
    }

    var colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 11]);

    //style function
    function styleGeo(geojson) {
        let value
        if (layer === 'gaws' || layer === 'gaws2015') {
            if (layer === 'gaws') {
                value = geojson.properties['totalpap_cap'];
            } else if (layer === 'gaws2015') {
                value = geojson.properties['physicians2015_cap'];
            }
        }

        if (layer === 'gaws' || layer === 'gaws2015') {
            // check if value is null or undefined
            if (value === null || value === undefined || value === "No data") {
                return {
                    fillColor: 'black',
                    fillOpacity: 0.4,
                    color: 'black',
                    opacity: 1,
                    weight: 1
                }
            } else {
                return {
                    fillColor: getColor(value),
                    fillOpacity: .7,
                    color: 'black',
                    opacity: 1,
                    weight: 1
                };
            }
        } else if (layer === 'npap') {
            value = geojson.properties['totalnpap_cap'];
            return {
                fillColor: colorScale(value),
                fillOpacity: 0.4,
                color: 'black',
                opacity: 1,
                weight: 1
            };
        }

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
            if (feature.properties && feature.properties[prop] != null && feature.properties[prop] != undefined) {
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

    let propertiesToDisplay;
    if (layer === 'gaws') {
        propertiesToDisplay = {
            'totalpap': 'PAPs',
            'totalpap_cap': 'PAP density'
        }
    } else if (layer === 'gaws2015') {
        propertiesToDisplay = {
            'physicians2015': 'PAPs (2016)',
            'physicians2015_cap': 'PAP density (2016)'
        }
    } else if (layer === 'npap') {
        propertiesToDisplay = {
            'totalnpap': 'NPAPs',
            'totalnpap_cap': 'NPAP density',
        }
    }

    /// this function is called when a feature is clicked, and passes the feature to the updateDom function
    /// this is to separate the updateDom function
    /// not clear why the click event cant't call updateDom directly with e.target.feature but here we are
    function clickfunc(e) {
        var layer = e.target; // This is the layer that was clicked
        var feature = layer.feature; // Accessing the feature directly from the layer
        updateDom(feature);
    } 

    /// this function updates the DOM with the data from the clicked feature
    /// called by both the click event and the search event
    function updateDom(feature) {if (isiframe === false) {
        var featureProperties = extractProperties(feature); // Ensure this function is callable and properly returning properties
        document.getElementById('country-name').innerHTML = feature.properties['NAME_LONG'];
        if (feature.properties['population'] === 'No data' || feature.properties['population'] === null || isNaN(feature.properties['population'])) {
            document.getElementById('country-population').innerHTML = 'Population: No data';
        } else {
            document.getElementById('country-population').innerHTML = 'Population: ' + (feature.properties['population'] / 10).toFixed(2) + ' million';
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
        console.log('this is an iframe, suppressing clicks');
        var featureProperties = extractProperties(feature); // Ensure this function is callable and properly returning properties
        document.getElementById('modal-country-name').innerHTML = feature.properties['NAME_LONG'];
        if (feature.properties['population'] === 'No data' || feature.properties['population'] === null || isNaN(feature.properties['population'])) {
            document.getElementById('modal-country-population').innerHTML = 'Population: No data';
        } else {
            document.getElementById('modal-country-population').innerHTML = 'Population: ' + (feature.properties['population'] / 10).toFixed(2) + ' million';
        }
        document.getElementById('modal-country-totalpap').innerHTML = featureProperties['totalpap'].toLocaleString();
        document.getElementById('modal-country-totalpap_cap').innerHTML = featureProperties['totalpap_cap'];
        document.getElementById('modal-country-PAP2015').innerHTML = featureProperties['physicians2015'].toLocaleString();
        document.getElementById('modal-country-pap_density_2015').innerHTML = featureProperties['physicians2015_cap'];
        document.getElementById('modal-country-totalnpap').innerHTML = featureProperties['totalnpap'].toLocaleString();
        document.getElementById('modal-country-totalnpap_cap').innerHTML = featureProperties['totalnpap_cap'];
        document.getElementById('modal-country-NPAP2015').innerHTML = featureProperties['nurses2015'].toLocaleString();
        document.getElementById('modal-country-npap_density_2015').innerHTML = featureProperties['nurses2015_cap'];
        document.getElementById('modal-country-details').style.display = '';
        if (featureProperties['totalpap_cap'] === 'No data' || featureProperties['totalpap_cap'] === null || isNaN(featureProperties['totalpap_cap'])) {
            document.getElementById('modal-card-header').style.backgroundColor = hexToRGBA('black', 0.7);
            document.getElementById('modal-card-header-title').classList.remove('is-size-4');
        } else {
            document.getElementById('modal-card-header').style.backgroundColor = hexToRGBA(getColor(featureProperties['totalpap_cap']), 0.7);
        }
        document.getElementById('modal-card-header-title').classList.add('is-size-4');
        document.getElementById('map_modal').classList.add('is-active');
    };
    }

    function onEachFeature(feature, layer) {
        var featureProperties = extractProperties(feature);

        var tooltipContent = '';

        try {

            // Check for and add the country name
            if (feature.properties && feature.properties['NAME_LONG']) {
                tooltipContent += '<strong>Country:</strong> ' + feature.properties['NAME_LONG'];
            }
            // Loop over each property and add its data
            for (const key in propertiesToDisplay) {
                tooltipContent += `<br><strong>${propertiesToDisplay[key]}:</strong> `;
                var value = featureProperties[key];
                tooltipContent += value;

            }

            // Bind the constructed tooltip content
            layer.bindTooltip(tooltipContent);

            /// click funciton
            
            // Event handlers
            layer.on({
                mouseover: highlightGeo,
                mouseout: resetGeo,
                click: clickfunc,
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


    var legend = L.control({ position: 'bottomleft' });
    /////////////////////////////// legend control

    // first if it is gaws or gaws2015
    if (layer === 'gaws' || layer === 'gaws2015') {
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
    } else if (layer === 'npap') {

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 10], // Start and end points of your domain
                labelPoints = [0, 2, 4, 6, 8, 10], // Points where labels will be added
                n = 256, // Number of different colors to represent in the gradient
                gradientHTML = '',
                labelsHTML = '<div class="legend-labels">';

            // Add labels
            for (var j = 0; j < labelPoints.length; j++) {
                labelsHTML += `<span style="left:${(labelPoints[j] / grades[1] * 100)}%">${labelPoints[j]}</span>`;
            }
            labelsHTML += '</div>';

            // Create a gradient by iterating over a range of values
            for (var i = 0; i < n; i++) {
                var value = grades[0] + i * (grades[1] - grades[0]) / n;
                var color = colorScale(value);
                gradientHTML += `<i style="background-color:${color};"></i>`;
            }

            // Add labels and gradient bar to the legend
            div.innerHTML = labelsHTML + '<div class="legend-gradient">' + gradientHTML + '</div>';

            // Add caption
            div.innerHTML += '<div>NPAPs per 100,000 population<br></div>';

            return div;
        };


        legend.addTo(map);
    };
    ///////////////////
    var searchControl = new L.Control.Search({
        position: 'topleft',
        layer: geojson,
        propertyName: 'NAME_LONG',
        initial: false,
        collapsed: false,
        
        moveToLocation: function(latlng, title, map) {
			//map.fitBounds( latlng.layer.getBounds() );
			var zoom = map.getBoundsZoom(latlng.layer.getBounds());
  			map.setView(latlng, zoom); // access the zoom
		},        
        marker: false
    });
    searchControl.on('search:locationfound', function(e) {
       // Apply the same style as the highlightGeo function
        e.layer.setStyle({
            fillOpacity: 0.5, // Adjusted for visibility
            weight: 3,        // Thicker border to mimic hover style
        });
        if (e.layer.getTooltip()) {
            e.layer.openTooltip(); // Open the tooltip if it exists
        }
        // searchfunc(e);
        updateDom(e.layer.feature);
    }).on('search:collapsed', function(e) {
        geojson.eachLayer(function(layer) { // Reset styles for all layers
            geojson.resetStyle(layer);
        });
    });
    
        map.addControl(searchControl);

    return map;
    
}
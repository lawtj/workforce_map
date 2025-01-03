export function createMap(ohnsData, isiframe){
    const map = L.map('map', {
        noWrap: true,
    }).setView([34, 5], 2);

    const myInterpolator = t => {
    // This uses d3.interpolateRgb, which interpolates between two RGB colors
    return d3.interpolateRgb('#C4e4db', '#547fa1')(t);  // Simple gradient from red to blue
    }

    var colorScale = d3.scaleSequential(d3.interpolatePurples)
        .domain([0, 10]);        
        

    //style function
    function styleGeo(geojson) {
        var value = geojson.properties['Oral, Head & Neck Surgeons per Capita'];
        // check if value is null or undefined
        if (value === null || value === undefined) {
            return {
                fillColor: 'black',
                fillOpacity: 0.1,
                color: 'black',
                opacity: 1,
                weight: 1
            };

        }
        return {
            fillColor: colorScale(value),
            fillOpacity: 1,
            color: 'black',
            opacity: 1,
            weight: 1
        };

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

    function onEachFeature(feature, layer) {
        var tooltipContent = '';

        // Check for and add the country name
        if (feature.properties && feature.properties['NAME_LONG']) {
            tooltipContent += '<strong>Country:</strong> ' + feature.properties['NAME_LONG'];
        }

        // Add 'Oral, Head & Neck Surgeons per Capita' data or 'No data' if unavailable
        tooltipContent += '<br><strong>Density of OHNS/ENT Providers per 100k Population:</strong> ';
        tooltipContent += (feature.properties && feature.properties['Oral, Head & Neck Surgeons per Capita']) ?
            feature.properties['Oral, Head & Neck Surgeons per Capita'] : 'No data';

        // Add 'Oral, Head & Neck Surgeons' data or 'No data' if unavailable
        tooltipContent += '<br><strong>Number of OHNS/ENT Providers:</strong> ';
        tooltipContent += (feature.properties && feature.properties['Oral, Head, & Neck Surgeons']) ?
            feature.properties['Oral, Head, & Neck Surgeons'] : 'No data';

        // Bind the constructed tooltip content
        layer.bindTooltip(tooltipContent);

        // Event handlers
        layer.on({
            mouseover: highlightGeo,
            mouseout: resetGeo,
            click: 
                function(){
                    if (isiframe === true){
                        console.log('this is an iframe, suppressing clicks')
                    }
                }
        });
    };


    const geojson = L.geoJSON(ohnsData, {
        style: styleGeo,
        onEachFeature: onEachFeature
    }
    ).addTo(map);

    var legend = L.control({ position: 'topright' });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10], // Start and end points of your domain
            labelPoints = [0, 2, 4, 6, 7, 9, 11], // Points where labels will be added
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
        div.innerHTML += '<div><strong>OHNS/ENT Providers per 100,000 Population</strong><br></div>';

        return div;
    };


    legend.addTo(map);

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

    }).on('search:collapsed', function(e) {
        geojson.eachLayer(function(layer) { // Reset styles for all layers
            geojson.resetStyle(layer);
        });
    });
    
        map.addControl(searchControl);
    return map;
}
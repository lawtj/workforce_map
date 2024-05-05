export function createMap(wfnsData, isiframe){
    const map = L.map('map', {
        noWrap: true,
        wheelPxPerZoomLevel:800
    }).setView([34, 5], 2);

    // map.scrollWheelZoom.disable();
    const myInterpolator = t => {
    // This uses d3.interpolateRgb, which interpolates between two RGB colors
    return d3.interpolateRgb('#C4e4db', '#547fa1')(t);  // Simple gradient from red to blue
    }

    const threeInterpolator = t => {
    // This uses d3.interpolateRgbBasis, which interpolates between multiple RGB colors
    // gradient between red to yellow to green
    return d3.interpolateRgbBasis(['#f44336', '#ffd966', '#6aa84f'])(t);
    }

    var colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
        .domain([0, 5.9]);        
    
    const scaleDiverging = d3.scaleDiverging([0, 1, 5.9], d3.interpolateRdYlGn);
        

    //style function
    function styleGeo(geojson) {
        var value = geojson.properties['density_2022'];
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
            fillColor: scaleDiverging(value),
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
        tooltipContent += '<br><strong>Density of Neurosurgeons per 100k Population:</strong> ';
        tooltipContent += (feature.properties && feature.properties['density_2022'] != null && feature.properties['density_2022'] != undefined) ?
            feature.properties['density_2022'] : 'No data';

        // Add 'Oral, Head & Neck Surgeons' data or 'No data' if unavailable
        tooltipContent += '<br><strong>Number of Neurosurgeons:</strong> ';
        tooltipContent += (feature.properties && feature.properties['workforce_2022'] != null && feature.properties['workforce_2022'] != undefined) ?
            feature.properties['workforce_2022'] : 'No data';

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
                    console.log(feature.properties['NAME_LONG'], feature.properties['density_2022'], feature.properties['workforce_2022'])
                }
        });
    };


    const geojson = L.geoJSON(wfnsData, {
        style: styleGeo,
        onEachFeature: onEachFeature
    }
    ).addTo(map);

    var legend = L.control({ position: 'topright' });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 5.9], // Start and end points of your domain
            labelPoints = [0, 1, 2, 3, 4, 5], // Points where labels will be added
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
            var color = scaleDiverging(value);
            gradientHTML += `<i style="background-color:${color};"></i>`;
        }

        // Add labels and gradient bar to the legend
        div.innerHTML = labelsHTML + '<div class="legend-gradient">' + gradientHTML + '</div>';

        // Add caption
        div.innerHTML += '<div><strong>Neurosurgeons per 100,000 Population</strong><br></div>';

        return div;
    };


    legend.addTo(map);
    return map;
}
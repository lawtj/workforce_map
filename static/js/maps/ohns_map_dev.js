export function createOHNSmap(ohnsData, isiframe,colors,range_min,range_max){
    const map = L.map('map', {
        noWrap: true,
    }).setView([34, 5], 2);

    const myInterpolator = t => {
    // This uses d3.interpolateRgb, which interpolates between two RGB colors
    return d3.interpolateRgb('#C4e4db', '#547fa1')(t);  // Simple gradient from red to blue
    }

    var colorScale = d3.scaleSequential(colors)
        .domain([range_min, range_max]);        
        

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
            grades = [range_min, range_max], // Start and end points of your domain
            n = 256, // Number of different colors to represent in the gradient
            gradientHTML = '',
            labelsHTML = '<div class="legend-labels">';
    
        // Create a gradient by iterating over a range of values
        for (var i = 0; i < n; i++) {
            var value = grades[0] + (i * (grades[1] - grades[0]) / n);
            var color = colorScale(value);
            gradientHTML += `<i style="background-color:${color}; width: ${(1 / n) * 100}%;"></i>`;  // Ensure each segment of the gradient has equal width
        }
    
        // Define label points and add labels. You might want to add more label points based on your needs
        var labelPoints = [range_min, range_max];
        labelPoints.forEach((point, index) => {
            // Calculate the position of the label based on its value
            var position = ((point - grades[0]) / (grades[1] - grades[0])) * 100;
            labelsHTML += `<span style="left:${position}%">${point}</span>`;
        });
    
        labelsHTML += '</div>';
    
        // Add labels and gradient bar to the legend
        div.innerHTML = labelsHTML + '<div class="legend-gradient">' + gradientHTML + '</div>';
    
        // Add caption
        div.innerHTML += '<div><strong>OHNS/ENT Providers per 100,000 Population</strong><br></div>';
    
        return div;
    };
    


    legend.addTo(map);
    return map;
}
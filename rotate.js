/*
    MIT License

    Copyright (c) 2018-2022 Atanu Mallick

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

const width = 950;
const height = 500;
const config = {
    speed: 0.005,
    verticalTilt: -40,
    horizontalTilt: 0
}
let locations = [];
const svg = d3.select('svg')
.attr("preserveAspectRatio", "xMidYMin slice")
.attr("viewBox", "0 0 950 500")
.classed("svg-content", true);
;
const markerGroup = svg.append('g');
const projection = d3.geoOrthographic();
const initialScale = projection.scale();
const path = d3.geoPath().projection(projection);
const center = [width / 2, height / 2];

drawGlobe();
drawGraticule();
enableRotation();

function drawGlobe() {
    d3.queue()
        .defer(d3.json, 'world.json')
        .defer(d3.json, 'locations.json')
        .await((error, worldData, locationData) => {
            svg.selectAll(".segment")
                .data(topojson.feature(worldData, worldData.objects.countries).features)
                .enter().append("path")
                .attr("class", "segment")
                .attr("d", path)
                .style("stroke", "#888")
                .style("stroke-width", "1px")
                .style("fill", (d, i) => '#e5e5e5')
                .style("opacity", ".6");
            locations = locationData;
            drawMarkers();
            drawLine();
        });
}

function drawGraticule() {
    const graticule = d3.geoGraticule()
        .step([10, 10]);

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
        .style("fill", "#fff")
        .style("stroke", "#ccc");
}

function enableRotation() {
    d3.timer(function (elapsed) {
        projection.rotate([config.speed * elapsed - 120, config.verticalTilt, config.horizontalTilt]);
        svg.selectAll("path").attr("d", path);
        drawMarkers();
        drawLine();
    });
}

function drawMarkers() {
    const markers = markerGroup.selectAll('circle')
        .data(locations);
    markers
        .enter()
        .append('circle')
        .merge(markers)
        .attr('cx', d => projection([d.longitude, d.latitude])[0])
        .attr('cy', d => projection([d.longitude, d.latitude])[1])
        .attr('fill', d => {
            const coordinate = [d.longitude, d.latitude];
            gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? 'none' : 'steelblue';
        })
        .attr('r', 7);

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}


function drawLine() {
    const markers = markerGroup.selectAll('line')
        .data(locations);
    markers
        .enter()
        .append('line')
        .merge(markers)
        .attr('x1', d => projection([d.longitude, d.latitude])[0])
        .attr('y1', d => projection([d.longitude, d.latitude])[1])
        .attr('x2', d => projection([8.660185, 49.885939])[0])
        .attr('y2', d => projection([8.660185, 49.885939])[1])
        .attr('stroke', d => {
            const coordinate = [d.longitude, d.latitude];
            gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? 'none' : 'steelblue';
        })
    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}


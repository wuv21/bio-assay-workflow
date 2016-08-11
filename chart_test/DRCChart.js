function DRCChart() {
    var width = 800,
        height = 500;

    var margin = {left:50, top:10, bottom:20, right:10};

    function my(selection) {
        selection.each(function(data) {

            var x = []
            var y = []
            data.forEach(function(arr) {
                arr.forEach(function(a) {
                    x.push(a.x)
                    y.push(a.y)
                });
            });

            var xScale = d3.scale.log().domain([d3.min(x), d3.max(x)]).range([margin.left, width - margin.right]);
            var yScale = d3.scale.linear().domain([0, d3.max(y)]).range([height - margin.top - margin.bottom, margin.top]);


            var svg = d3.select(this)
                .selectAll('.DRCChart')
                .data(data, function(d) {return d});

            var svgEnter = svg.enter()
                .append('svg')
                .attr('class', 'DRCChart')
                .attr('width', width)
                .attr('height', height);

            var xAxisLabel = svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + (height - margin.top - margin.bottom) + ')');

            var yAxisLabel = svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + margin.left + ',' + 0 + ')');


            function setAxes() {
                var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
                var yAxis = d3.svg.axis().scale(yScale).orient('left');

                xAxisLabel.transition().duration(500).call(xAxis);
                yAxisLabel.transition().duration(500).call(yAxis);
            }

            setAxes();

            function sigmoid(x, top, bottom, ec) {
                return bottom + ((top - bottom) / (1 + Math.pow(10, Math.log10(ec) - x)))
            }

            var line = d3.svg.line()
                .x(function(i) {return i.x})
                .y(function(i) {return i.y});

            svg.exit().remove();

            data.forEach(function(d) {
                var circles = svgEnter.selectAll('.residual').data(d);

                circles.enter()
                    .append('circle')
                    .attr('r', 3)
                    .attr('cx', function(i) {return xScale(i.x)})
                    .attr('cy', function(i) {return yScale(i.y)});

                circles.exit().remove();

                var generated = [];
                for (var j=0.0001; j<100001; j *= 1.05) {
                    generated.push({
                        x: xScale(j),
                        y: yScale(sigmoid(Math.log10(j), 5.215, 121.2, 6.699))
                    });

                };

                generated.push({
                    x: xScale(100000),
                    y: yScale(sigmoid(Math.log10(100000), 5.215, 121.2, 6.699))
                });

                console.log(generated.length)

                svgEnter.append('path')
                    .datum(generated)
                    .attr('class', 'line')
                    .attr('d', line);
            });

            // var pebbles = svgEnter.selectAll('.pebble').data(data[0].values);

            // pebbles.enter()
            //     .append("rect")
            //     .attr("class", "pebble")
            //     .attr("width", squareSize)
            //     .attr("height", squareSize)
            //     .style("fill", function(d) {return color(d.name)})
            //     .attr("x", width / 2)
            //     .attr("y", 0)
            //     .attr("title", function(x, i) {return x.bucket + '-' + i})
            //     .on('mouseover', function(d) {
            //         d3.select(this)
            //             .style('fill', 'cyan');
            //     })
            //     .on('mouseout', function(d) {
            //         d3.select(this)
            //             .style('fill', function(d) {return color(d.name)});
            //     })
            //     .append("rect:title")
            //     .text(function(d, i) {return i});


            // pebbles.exit().remove();
        })
    }

    my.width = function(val) {
        if (!arguments.length) return width;

        width = val;
        return my;
    };

    my.height = function(val) {
        if (!arguments.length) return height;

        height = val;
        return my;
    };
    
    return my;
}
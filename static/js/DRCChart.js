function DRCChart() {
    var width = 450,
        height = 500;

    var margin = {left:10, top:10, bottom:20, right:10};

    function my(selection) {
        selection.each(function(data) {

            
            var xScale = d3.scale.linear().domain(null).range(null);
            var yScale = d3.scale.linear().domain(null).range(null);

            var svg = d3.select(this)
                .selectAll('.DRCChart')
                .data(data, function(d) {return d.id});

            var svgEnter = svg.enter()
                .append('svg')
                .attr('class', 'pebbleCharts')
                .attr('width', width)
                .attr('height', height);

            var xAxisLabel = svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + margin.left + ',' + (height - margin.top - margin.bottom) + ')');

            var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
            xAxisLabel.transition().duration(400).call(xAxis);

            svg.exit().remove();

            var pebbles = svgEnter.selectAll('.pebble').data(data[0].values);

            pebbles.enter()
                .append("rect")
                .attr("class", "pebble")
                .attr("width", squareSize)
                .attr("height", squareSize)
                .style("fill", function(d) {return color(d.name)})
                .attr("x", width / 2)
                .attr("y", 0)
                .attr("title", function(x, i) {return x.bucket + '-' + i})
                .on('mouseover', function(d) {
                    d3.select(this)
                        .style('fill', 'cyan');
                })
                .on('mouseout', function(d) {
                    d3.select(this)
                        .style('fill', function(d) {return color(d.name)});
                })
                .append("rect:title")
                .text(function(d, i) {return i});


            pebbles.exit().remove();

            pebbles.transition()
                .duration(function(d, i) {return i / data[0].values.length * transitionDelay;})
                .attr("x", function(d) {
                    var index = buckets.indexOf(d.bucket);

                    counters[index].xCounter++;
                    var adjustment = xScale.rangeBand() / 2 - (squareSize * squareCols + squareMargin * (squareCols - 1)) / 2;

                    return margin.left + xScale(d.bucket) + adjustment + rowScale((counters[index].xCounter - 1) % squareCols);
                })
                .attr("y", function(d) {
                    var index = buckets.indexOf(d.bucket);
                    counters[index].yCounter++;

                    if ((counters[index].yCounter - 1) % squareCols == 0) {
                        counters[index].hCounter++;
                    }

                    return (height - margin.bottom -margin.top) - (counters[index].hCounter * (squareMargin + squareSize));
                });

            pebbles.exit().transition().duration(function(d, i) {return i/data[0].values.length * transitionDelay}).remove();
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
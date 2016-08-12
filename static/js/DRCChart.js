function DRCChart() {
    var width = 900,
        height = 500;

    var margin = {left:50, top:10, bottom:20, right:10};

    function my(selection) {
        selection.each(function(data) {
            var x = []
            var y = []
            data.forEach(function(arr) {
                arr.vals.forEach(function(a) {
                    x.push(a.x)
                    y.push(_.mean([a.y0, a.y1]))
                });
            });

            var xScale = d3.scale.log().domain([d3.min(x) * 0.1, d3.max(x) * 10]).range([margin.left, width - margin.left -  margin.right]);
            var yScale = d3.scale.linear().domain([0, d3.max(y) * 1.05]).range([height - margin.top - margin.bottom, margin.top]);

            var svg = d3.select(this)
                .selectAll('.DRCChart')
                .data(data, function(d) {return d.id});

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

            data.forEach(function(arr) {
                var circles = svgEnter.selectAll('.residual').data(arr.vals);

                circles.enter()
                    .append('circle')
                    .attr('r', 3)
                    .attr('cx', function(i) {return xScale(i.x)})
                    .attr('cy', function(i) {return yScale(_.mean([i.y0, i.y1]))})
                    .style('fill', '#FFF')
                    .transition()
                    .duration(1000)
                    .style('fill', '#000');

                circles.exit().remove();

                var generated = [];
                for (var j=0.0001; j<100001; j *= 1.05) {
                    generated.push({
                        x: xScale(j),
                        y: yScale(sigmoid(Math.log10(j), arr.top, arr.bottom, arr.ec))
                    });

                };

                generated.push({
                    x: xScale(100000),
                    y: yScale(sigmoid(Math.log10(100000), 5.215, 121.2, 6.699))
                });

                var regression_line = svgEnter.append('path')
                    .datum(generated)
                    .attr('class', 'line')
                    .attr('d', line)
                    .style('stroke', '#FFF')
                    .transition()
                    .duration(1000)
                    .style('stroke', 'steelblue');
            });

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
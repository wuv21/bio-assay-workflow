function DRCChart() {
    var width = 900,
        height = 500;

    var margin = {left:50, top:10, bottom:20, right:10};

    function my(selection) {
        selection.each(function(data) {
            var x = [];
            var y = [];
            var regr = [];

            data.forEach(function(d) {
                d.datasets.forEach(function(arr) {
                    arr.vals.forEach(function(a) {
                        x.push(a.x)
                        y.push(_.mean([a.y0, a.y1]))
                    });

                    regr.push(arr.top);
                    regr.push(arr.bottom);
                });
            });

            var xMax = d3.max(x);
            var xScale = d3.scale.log().domain([d3.min(x) * 0.1, d3.max(x) * 10]).range([margin.left, width - margin.left -  margin.right]);
            var yScale = d3.scale.linear().domain([d3.min(_.concat(regr, [0])) * 1.5, d3.max(_.concat(y, regr)) * 1.05]).range([height - margin.top - margin.bottom, margin.top]);

            var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹";

            var formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };

            var svg = d3.select(this)
                .selectAll('.DRCChart')
                .data(data, function(d) {return Math.random(10007)});

            svg.exit().remove();

            var svgEnter = svg.enter()
                .append('svg')
                .attr('class', 'DRCChart')
                .attr('width', width)
                .attr('height', height + 15);

            var xAxisLabel = svgEnter.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + 0 + ',' + (height - margin.top - margin.bottom) + ')');

            var yAxisLabel = svgEnter.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + margin.left + ',' + 0 + ')');

            var xAxisTitle = svgEnter.append('text')
                .attr('transform', 'translate(' + (margin.left+((width-margin.left-margin.right) / 2) - 40) + ',' + (height + margin.top + margin.bottom - 20) + ')')
                .text('[Drug] (nM)');

            var yAxisTitle = svgEnter.append('text')
                .attr('transform', 'translate(' + 12 + ', ' + ((height + margin.top + margin.bottom + 50) / 2) + ') rotate(-90)')
                .text("% control");

            function setAxes() {
                var xAxis = d3.svg.axis().scale(xScale)
                    .orient('bottom')
                    .ticks(10, function(d) { return 10 + formatPower(Math.round(Math.log(d) / Math.LN10)); });
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

            var series = svgEnter.selectAll('.series').data(data[0].datasets, function(d) {return d.id});
            var colors = d3.scale.category10();

            var seriesEnter = series.enter()
                .append('g')
                .attr('class', 'series')
                .style('fill', function(d, i) {return colors(i)})
                .style('stroke', function(d, i) {return colors(i)});

            seriesEnter.transition().duration(1000);
            series.exit().remove();

            var circles = seriesEnter.selectAll('.residual')
                .data(function(d) {return d.vals})
                .enter()
                .append('circle')
                .attr('class', 'residual')
                .attr('r', 3)
                .attr('cx', function(i) {return xScale(i.x)})
                .attr('cy', function(i) {return yScale(_.mean([i.y0, i.y1]))})
                .attr('id', function(i) {return i.x + ',' + _.mean([i.y0, i.y1])});

            var regression_line = seriesEnter.append('path')
                .datum(function(d) {
                    var generated = [];
                    for (var j=d3.min(x); j<xMax + 1; j *= 1.05) {
                        generated.push({
                            x: xScale(j),
                            y: yScale(sigmoid(Math.log10(j), d.top, d.bottom, d.ec))
                        });

                    };

                    generated.push({
                        x: xScale(xMax),
                        y: yScale(sigmoid(Math.log10(x.Max), d.top, d.bottom, d.ec))
                    });
                    console.log(generated);
                    return generated;
                })
                .attr('class', 'line')
                .attr('d', line)
                .style('fill', 'none');

            var text = seriesEnter.append("text")
                .datum(function(d) {return d})
                .attr("x", xScale(xMax * 1.5))
                .attr("y", function(i) {return yScale(i.top)})
                .style("font", "10px")
                .text("test label");

            // var ec50_point = svgEnter.append('circle')
            //     .attr('r', 3)
            //     .attr('cx', xScale(arr.ec))
            //     .attr('cy', yScale(sigmoid(Math.log10(arr.ec), arr.top, arr.bottom, arr.ec)))
            //     .style('fill', 'red')
            //
            // var ec50_label = svgEnter.append("text")
            //     .attr("x", xScale(arr.ec) + 8)
            //     .attr("y", yScale(sigmoid(Math.log10(arr.ec), arr.top, arr.bottom, arr.ec)))
            //     .text("EC\u2085\u2080 = " + arr.ec.toFixed(4));
        });
    };

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

document.addEventListener('DOMContentLoaded', function() {
    var y0 = [116.136,106.434,124.895,110.316,94.625,49.778,4.917,9.014,6.047,5.956]
    var y1 = [133.274,122.674,102.343,142.231,128.382,50.975,6.529,11.635,6.225,6.919]
    var x = [0.0001,0.001,0.01,0.1,1.0,10.0,100.0,1000.0,10000.0,100000.0]

    var raw_vals = [];
    for (var i = 0; i < y0.length; i++) {
        raw_vals.push({
            x: x[i],
            y0: y0[i],
            y1: y1[i]
        });
    }

    var sampleData = {
        id: 0,
        vals: raw_vals,
        bottom: 121.2,
        top: 5.215,
        ec: 6.699
    };

    var myChart = DRCChart();
    var chartWrapper = d3.select('#vis').datum([sampleData]).call(myChart);

    document.getElementById('test-btn').addEventListener('click', function() {
        console.log('clicked');

        sampleData = [];
        var minYear = Math.floor(Math.random() * (2010 - 2007) + 2007);
        var maxYear = Math.floor(Math.random() * (10) + minYear);

        for (var i = minYear; i < maxYear; i++) {
            months.forEach(function (month) {
                sampleData.push({
                    month: month,
                    year: i,
                    value: Math.round(Math.random() * 50)
                });
            });
        }
        chartWrapper.datum([sampleData]).call(myChart);
    });

    document.getElementById('test-btn-2').addEventListener('click', function() {
        myChart.width(600)
            .height(500)
            .arcConstraints([50, 150]);
        chartWrapper.call(myChart)
    });


});
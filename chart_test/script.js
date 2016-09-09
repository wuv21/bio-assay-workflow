document.addEventListener('DOMContentLoaded', function() {
    var y0 = [116.136,106.434,124.895,110.316,94.625,49.778,4.917,9.014,6.047,5.956];
    var y1 = [133.274,122.674,102.343,142.231,128.382,50.975,6.529,11.635,6.225,6.919];
    var x = [0.0001,0.001,0.01,0.1,1.0,10.0,100.0,1000.0,10000.0,100000.0];

    //  Q148K NL4-3
    var y0_0 = [109.557,119.052,127.558,105.863,144.836,151.813,136.279,52.524,52.956,59.969];
    var y1_0 = [123.404,143.482,133.269,121.914,137.197,167.418,129.478,53.896,46.329,56.327];

    // G140S+Q148K NL4-3
    var y0_1 = [113.276,116.206,105.995,100.039,120.767,90.432,38.692,15.200,14.917,14.326]
    var y1_1 = [111.374,97.497,89.020,92.216,103.095,90.920,29.931,13.903,18.181,12.743]

    var raw_vals = [];
    var raw_vals_0 = [];
    var raw_vals_1 = [];

    for (var i = 0; i < y0.length; i++) {
        raw_vals.push({
            x: x[i],
            y0: y0[i],
            y1: y1[i]
        });

        raw_vals_0.push({
            x: x[i],
            y0: y0_0[i],
            y1: y1_0[i]
        });

        raw_vals_1.push({
            x: x[i],
            y0: y0_1[i],
            y1: y1_1[i]
        });
    }

    var sampleData = {
        id: 0,
        datasets: []
    };

    sampleData.datasets.push({
        id: 0,
        vals: raw_vals,
        bottom: 121.2,
        top: 5.215,
        ec: 6.699,
        name: "WT NL4-3"
    });

    sampleData.datasets.push({
        id: 1,
        vals: raw_vals_0,
        bottom: 133.844,
        top: 47.809,
        ec: 374.312,
        name: "Q148K NL4-3"
    });


    sampleData.datasets.push({
        id: 2,
        vals: raw_vals_1,
        bottom: 105.871,
        top: 12.9876,
        ec: 37.84,
        name: "G140S+Q148K NL4-3"
    });

    var myChart = DRCChart();
    var chartWrapper = d3.select('#vis').datum([sampleData]).call(myChart);

    var btn_change = document.getElementById('test-btn');
    btn_change.addEventListener('click', function() {
        if (sampleData.datasets.length == 2) {
            sampleData = {id: 0, datasets:sampleData.datasets};

            sampleData.datasets.push({
                id: 2,
                vals: raw_vals_1,
                bottom: 105.871,
                top: 12.9876,
                ec: 37.84,
                name: "G140S+Q148K NL4-3"
            });
        } else {
            sampleData = {id: 0, datasets:sampleData.datasets};
            sampleData.datasets.pop();
        }
        sampleData.id = Math.random() * 10007;
        chartWrapper.datum([sampleData]).call(myChart);
    });
});

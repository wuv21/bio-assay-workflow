angular.module('bioApp').controller('OverviewController', ['$scope', '$http', '$filter', 'baseAddress', function($scope, $http, $filter, baseAddress) {
    $scope.sortSettings = {
        type: 'Plate_Reading_name',
        reverse: false
    };

    $scope.loadingDisplay = true;

    $scope.plates = [];
    $scope.selectedExp = {};
    $http.get(baseAddress + '/get_all_plates')
        .success(function(resp) {
            $scope.plates = resp;
        });

    $http.get(baseAddress + '/get_all_plate_quadrants')
        .success(function(resp) {
            var max_plate_id = resp[resp.length - 1].Plate_Reading_id;
            $scope.quadrants = Array.apply(null, Array(max_plate_id + 1)).map(function () {return []});

            resp.forEach(function(r) {
                $scope.quadrants[r.Plate_Reading_id].push(r);
            });

            $scope.loadingDisplay = false;
        });

    $scope.showQuadrants = function(option) {
        $scope.availableQuads = [];
        if (option && $scope.quadrants) {
            $scope.availableQuads = $scope.quadrants[option.id]
        }
    };

    $scope.experimentRedirect = baseAddress + '/analysis/';

    $scope.selectedCharts = {};
    $scope.selectedData = [];
    $scope.graphVisible = false;

    $scope.absData = {id: 0, datasets:[]};
    $scope.stageCharts = function(quad) {
        $scope.selectedCharts[quad.Quadrant_id] = !$scope.selectedCharts[quad.Quadrant_id];

        if ($scope.selectedCharts[quad.Quadrant_id]) {
            $scope.graphVisible = true;
            $scope.selectedData.push(quad);
        } else {
            _.pull($scope.selectedData, quad);
            if ($scope.selectedData.length == 0) {
                $scope.selectedData = [];
                $scope.graphVisible = false;
            }
        }

        // TODO fix graph redraw...so it doesn't redraw graph every time if existing data remains.
        $scope.absData = {id: Math.random()*13337, datasets:[]};
        $scope.selectedData.forEach(function(d) {
            var parsedVals = d.Quadrant_q_abs;
            var sample = {
                id: d.Quadrant_id,
                vals: [],
                bottom: d.regression[1],
                top: d.regression[0],
                ec: d.regression[2],
                name: d.Clone_aa_changes + ' (' + d.Clone_type + ')'
            };

            for (var i=0; i<parsedVals.length; i++) {
                sample.vals.push({
                    x: d.Quadrant_concentration_range[i],
                    y0: parsedVals[i][0],
                    y1: parsedVals[i][1]
                });
            }

            $scope.absData.datasets.push(sample);
        });
    };

    $scope.stagedQuads = [];

    $scope.addAllFromDate = function() {
        $scope.plates.forEach(function(p) {
            if (p.read_date == $scope.selectedExpDate) {
                console.log($scope.quadrants[p.id]);
                $scope.stagedQuads = $scope.stagedQuads.concat($scope.quadrants[p.id]);
            }
        });
    }

    $scope.addQuads = function() {
        $scope.selectedQuads.forEach(function(x) {$scope.stagedQuads.push(x)});
    };

    $scope.addAllQuads = function() {
        $scope.availableQuads.forEach(function(x) {$scope.stagedQuads.push(x)});
    };

    $scope.removeQuads = function() {
        _.pullAll($scope.stagedQuads, $scope.addedQuads);
    };

    $scope.removeAllQuads = function() {
        $scope.stagedQuads = [];
    };
}]);

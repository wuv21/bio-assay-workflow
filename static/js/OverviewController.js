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
            $scope.quadrants = resp;
            $scope.loadingDisplay = false;
        });

    $scope.showQuadrants = function(option) {
        $scope.availableQuads = [];
        if (option && $scope.quadrants) {
            $scope.quadrants.forEach(function(q) {
                if (q.Plate_Reading_id == option.id) {
                    $scope.availableQuads.push(q);
                }
            });
        }
    };

    $scope.experimentRedirect = baseAddress + '/analysis/';

    $scope.selectedCharts = {};
    $scope.selectedData = [];

    $scope.absData = {id: 0, datasets:[]};
    $scope.stageCharts = function(quad) {
        $scope.selectedCharts[quad.Quadrant_id] = !$scope.selectedCharts[quad.Quadrant_id];

        if ($scope.selectedCharts[quad.Quadrant_id]) {
            $scope.selectedData.push(quad);
        } else {
            _.pull($scope.selectedData, quad);
        }

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

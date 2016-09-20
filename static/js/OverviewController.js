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

    $scope.stagedQuads = [];
    $scope.addQuads = function() {
        $scope.selectedQuads.forEach(function(x) {$scope.stagedQuads.push(x)});
    }

    $scope.removeQuads = function() {
        _.pullAll($scope.stagedQuads, $scope.addedQuads);
    }
}]);

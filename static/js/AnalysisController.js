angular.module('bioApp').controller('AnalysisController', ['$scope', '$http', 'baseAddress', function($scope, $http, baseAddress) {
    var currentURL = window.location.href.split('/')
    var plateID = _.isNumber(Number(currentURL[currentURL.length - 1])) ? currentURL[currentURL.length - 1] : -1;

    $scope.selQuad = 0;
    $scope.absData = {
        id: 0,
        datasets: []
    };

    $scope.$watch('selQuad', function() {
        if ($scope.quads && $scope.quads[$scope.selQuad]) {
            var parsedVals = $scope.quads[$scope.selQuad].Quadrant_q_abs;

            var sample = {
                id: Number($scope.selQuad),
                vals: [],
                bottom: $scope.quads[$scope.selQuad].regression[1],
                top: $scope.quads[$scope.selQuad].regression[0],
                ec: $scope.quads[$scope.selQuad].regression[2],
                name: $scope.quads[$scope.selQuad].Clone_aa_changes + '(' + $scope.quads[$scope.selQuad].Clone_type + ')'
            };

            for (var i=0; i<parsedVals.length; i++) {
                sample.vals.push({
                    x: $scope.quads[$scope.selQuad].Quadrant_concentration_range[i],
                    y0: parsedVals[i][0],
                    y1: parsedVals[i][1]
                });
            }

            $scope.absData = {id: Number($scope.selQuad), datasets:[sample]};
        }
    });

    $http.get(baseAddress + '/get_plate/' + plateID)
        .success(function(resp) {
            $scope.plate = _.pickBy(resp[0], function(value, key) {return key[0] == "P"});
            $scope.quads = _.orderBy(resp, 'Quadrant_id');

            var parsedVals = $scope.quads[$scope.selQuad].Quadrant_q_abs;

            var sample = {
                id: Number($scope.selQuad),
                vals: [],
                bottom: $scope.quads[$scope.selQuad].regression[1],
                top: $scope.quads[$scope.selQuad].regression[0],
                ec: $scope.quads[$scope.selQuad].regression[2],
                name: $scope.quads[$scope.selQuad].Clone_aa_changes + ' (' + $scope.quads[$scope.selQuad].Clone_type + ')'
            };

            for (var i=0; i<parsedVals.length; i++) {
                sample.vals.push({
                    x: $scope.quads[$scope.selQuad].Quadrant_concentration_range[i],
                    y0: parsedVals[i][0],
                    y1: parsedVals[i][1]
                });
            }

            $scope.absData = {id: 0, datasets:[sample]};

            if ($scope.quads[$scope.selQuad].regression) {
                console.log('regression success');
            } else {
                $scope.showAlert("Unable to calculate regression", warning=true);
            }

        })
        .error(function(resp) {
            if (resp.msg) {
                $scope.showAlert(resp.msg, warning=true);
            } else {
                $scope.showAlert("No plate to show", warning=true);
            }

        });
}]);

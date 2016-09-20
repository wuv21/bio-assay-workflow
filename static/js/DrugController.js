angular.module('bioApp').controller('DrugController', ['$scope', '$http', '$filter', 'baseAddress', function($scope, $http, $filter, baseAddress) {
    $scope.newDrug = {
        name: '',
        abbrev: ''
    };

    $scope.createDrug = function() {
        if ($scope.newDrug.name && $scope.newDrug.abbrev) {
            $http.post(baseAddress + '/create_drug', $scope.newDrug)
                .success(function(resp) {
                    $scope.showAlert($filter('htmlToText')(resp.msg), warning=false);
                    $scope.newDrug = {};
                    $scope.drugForm.$setPristine();
                })
                .error(function(resp) {
                    $scope.showAlert($filter('htmlToText')(resp.msg), warning=true);
                });
        } else {
            $scope.showAlert('Error in creating drug - please ensure data is inputted correctly', warning=true);
        }
    };
}]);

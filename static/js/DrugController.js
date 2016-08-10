// separate drug controller

angular.module('bioApp').controller('DrugController', ['$scope', '$http', function($scope, $http) {
    // alert settings
    $scope.alertSettings = {
        visible: false,
        message: "",
        warning: false
    };

    $scope.closeAlert = function() {
        $scope.alertSettings.visible = false;
    };

    var showAlert = function(msg, warning) {
        $scope.alertSettings.message = msg;
        $scope.alertSettings.warning = warning;
        $scope.alertSettings.visible = true;
    };

    $scope.newDrug = {
        name: '',
        abbrev: ''
    };

    $scope.createDrug = function() {
        if ($scope.newDrug.name && $scope.newDrug.abbrev) {
            $http.post(baseAddress + '/create_drug', $scope.newDrug)
                .success(function(resp) {
                    showAlert(resp.msg, warning=false);
                })
                .error(function(resp) {
                    showAlert(resp.msg, warning=true);
                });
        } else {
            showAlert('Error in creating drug - please ensure data is inputted correctly', warning=true);
        }
    };
}]);
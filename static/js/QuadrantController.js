angular.module('bioApp').controller('QuadrantController', ['$scope', '$http', 'baseAddress', function($scope, $http, baseAddress) {
    $scope.plate = {
        name: "",
        date: "",
        letter: ""
    };
    $scope.quads = {};

    // quadrant visibility
    $scope.quadrantVisible = [true, false, false, false];

    $scope.selectQuadrant = function(q) {
        $scope.quadrantVisible = [false, false, false, false];
        $scope.quadrantVisible[q] = true;
    };

    $scope.orderDate = function(c) {
        var splitDate = c.Virus_Stock_harvest_date.split('/');
        
        return splitDate[2] + splitDate[0] + splitDate[1];
    }

    $scope.getAllData = function() {
        $http.get(baseAddress + '/get_all_stocks')
            .success(function(resp) {
                $scope.stockClones = resp;
        });

        $http.get(baseAddress + '/get_all_clones')
            .success(function(resp) {
                $scope.clones = resp;
            });

        $http.get(baseAddress + '/get_all_drugs')
            .success(function(resp) {
                $scope.allDrugs = resp;
            });
    };

    $scope.refreshData = function() {
        $scope.getAllData();
        $scope.showAlert('Virus stocks and drugs updated', warning=false);
    };

    $scope.getAllData();

    $scope.todayDate = function() {
        var date = new Date();
        var day = String(date.getDate());
        day = day.length < 2 ? "0" + day : day;

        var month = String(date.getMonth() + 1);
        month = month.length < 2 ? "0" + month : month;

        var year = String(date.getFullYear());

        $scope.plate.date = month + "/" + day + "/" + year;
    };

    $scope.submitPlate = function() {
        $scope.plate.quads = $scope.quads;
        console.log($scope.plate);

        $http.post(baseAddress + '/create_plate', $scope.plate)
            .success(function(resp) {
                $scope.showAlert(resp.msg, warning=false);
                window.location = resp.next_url;
            })
            .error(function(resp) {
                $scope.showAlert(resp.msg, warning=true);
            });
    }
}]);

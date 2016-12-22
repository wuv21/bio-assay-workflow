angular.module('bioApp').controller('MultipleController', ['$scope', '$http', 'baseAddress', function($scope, $http, baseAddress) {
    $scope.displaySections = {
        clones: true,
        stocks: false
    };

    $http.get(baseAddress + '/get_all_clones')
        .success(function(resp) {
            $scope.clones = resp;
    });

    $http.get(baseAddress + '/get_all_stocks')
        .success(function(resp) {
            $scope.stocks = resp;
    });

    $scope.redirect = {
        clone: baseAddress + '/edit_clone/',
        stock: baseAddress + '/edit_stock/'
    };
}]);

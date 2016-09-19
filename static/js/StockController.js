angular.module('bioApp').controller('StockController', ['$scope', '$http', '$filter', 'baseAddress', function($scope, $http, $filter, baseAddress) {
    $scope.toggleMenus = {
        newStockOldClone: true,
        newStockNewClone: false,
        newStockIsolate: false,
    };

    $scope.stockData = {
        cloneDate: '',
        selectedClone: null,
        virusStockDate: '',
        virusStockFFU: null,
        newCName: '',
        newCDate: '',
        newCAA: '',
        newCType: ''
    };

    $scope.newStockOldCloneOpen = function() {
        $scope.toggleMenus.newStockNewClone = false;
        $scope.toggleMenus.newStockIsolate = false;
        $scope.toggleMenus.newStockOldClone = !$scope.toggleMenus.newStockOldClone;
    };

    $scope.newStockNewCloneOpen = function() {
        $scope.toggleMenus.newStockOldClone = false;
        $scope.toggleMenus.newStockIsolate = false;
        $scope.toggleMenus.newStockNewClone = !$scope.toggleMenus.newStockNewClone;
    };

    $scope.newStockIsolateOpen = function() {
        $scope.toggleMenus.newStockOldClone = false;
        $scope.toggleMenus.newStockNewClone = false;
        $scope.toggleMenus.newStockIsolate = !$scope.toggleMenus.newStockIsolate;
    };

    $http.get(baseAddress + '/get_all_clones')
        .success(function(resp) {
            $scope.clones = resp;
    });

    $scope.createStock = function() {
        var data = {
            stockDate: $scope.stockData.virusStockDate,
            stockFFU: $scope.stockData.virusStockFFU,
            clone: $scope.stockData.selectedClone
        };

        if (data.stockDate && data.stockFFU && data.clone) {
            $http.post(baseAddress + '/create_stock', data)
                .success(function(resp) {
                    $scope.showAlert(resp.msg, warning=false);
                    $scope.stockData = {};
                    $scope.newOldForm.$setPristine();
                })
                .error(function(resp) {
                    $scope.showAlert(resp.msg, warning=true);
                });
        } else {
            $scope.showAlert('Error in creating stock - please ensure data is inputted correctly', warning=true);
        }
    };

    $scope.createStockAndClone = function() {
        var data = {
            cName: $scope.stockData.newCName,
            cDate: $scope.stockData.newCDate,
            cAA: $scope.stockData.newCAA,
            cType: $scope.stockData.newCType,
            stockDate: $scope.stockData.virusStockDate,
            stockFFU: $scope.stockData.virusStockFFU
        };

        if (data.stockDate && data.stockFFU) {
            $http.post(baseAddress + '/create_clone_and_stock', data)
                .success(function(resp) {
                    $scope.showAlert($filter('htmlToText')(resp.msg), warning=false);
                    $scope.stockData = {};
                    $scope.newNewForm.$setPristine();
                })
                .error(function(resp) {
                    $scope.showAlert($filter('htmlToText')(resp.msg), warning=true);
                });
        } else {
            $scope.showAlert('Error in creating clone and stock - please ensure data is inputted correctly', warning=true);
        }
    };

    $scope.createStockAndIsolate = function() {
        var data = {
            cName: $scope.stockData.newCName,
            cDate: '11/11/1111',
            cAA: $scope.stockData.newCAA,
            cType: $scope.stockData.newCType,
            stockDate: $scope.stockData.virusStockDate,
            stockFFU: $scope.stockData.virusStockFFU
        };

        if (data.stockDate && data.stockFFU) {
            $http.post(baseAddress + '/create_clone_and_stock', data)
                .success(function(resp) {
                    $scope.showAlert($filter('htmlToText')(resp.msg), warning=false);
                    $scope.stockData = {};
                    $scope.newIsolateForm.$setPristine();
                })
                .error(function(resp) {
                    $scope.showAlert($filter('htmlToText')(resp.msg), warning=true);
                });
        } else {
            $scope.showAlert('Error in creating isolate and stock - please ensure data is inputted correctly', warning=true);
        }
    };
}]);
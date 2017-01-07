angular.module('bioApp').controller('QuadrantController', ['$scope', '$http', 'baseAddress', function($scope, $http, baseAddress) {
    var currentURL = window.location.href.split('/')
    var plateID = !isNaN(Number(currentURL[currentURL.length - 1])) ? currentURL[currentURL.length - 1] : -1;
    $scope.editToggle = plateID >= 1;
    console.log($scope.editToggle);

    $scope.test = true;

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
                $scope.stockIndex = [];
                $scope.stockClones.forEach(function(e, i) {
                    $scope.stockIndex[e.Virus_Stock_id] = i;
                });
        });

        // $http.get(baseAddress + '/get_all_clones')
        //     .success(function(resp) {
        //         $scope.clones = resp;
        //     });

        $http.get(baseAddress + '/get_all_drugs')
            .success(function(resp) {
                $scope.allDrugs = resp;
                $scope.drugIndex = [];
                $scope.allDrugs.forEach(function(e, i) {
                    $scope.drugIndex[e.id] = i;
                });
            });
    };

    $scope.refreshData = function() {
        $scope.getAllData();
        $scope.showAlert('Virus stocks and drugs updated', warning=false);
    };

    $scope.getAllData();

    var checkHalfLog = function(n) {
        var nString = n.toString();
        var lastDigit = parseInt(nString[nString.length - 1]);

        return lastDigit == 4;
    };

    if ($scope.editToggle) {
        $http.get(baseAddress + '/get_plate/' + plateID)
            .success(function(resp) {
                if (resp.length > 0) {
                    $scope.plate.name = resp[0].Plate_Reading_name;
                    $scope.plate.date = resp[0].Plate_Reading_read_date;
                    $scope.plate.letter = resp[0].Plate_Reading_letter;

                    console.log(resp);

                    $scope.$evalAsync(function() {
                        resp.forEach(function(q, index) {
                            var q_id = (q.Plate_to_Quadrant_quad_location + 3).toString();

                            $scope.quads[q_id].disabled = false;

                            $scope.quads[q_id].inc = checkHalfLog(q.Quadrant_concentration_range[0]) || checkHalfLog(q.Quadrant_concentration_range[1]) ? 'halfLog10' : 'log10';

                            $scope.quads[q_id].numControls = q.Quadrant_num_controls;

                            q.Quadrant_concentration_range.forEach(function(c, i) {
                                $scope.quads[q_id].concRange[i].step = c;
                            });

                            $scope.quads[q_id].selectedClone = $scope.stockClones[$scope.stockIndex[q.Virus_Stock_id]];
                            $scope.quads[q_id].drug = $scope.allDrugs[$scope.drugIndex[q.Drug_id]];
                        });
                    });

                    console.log($scope.stockClones);
                }
            });
    }

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
        $scope.plate.edit = $scope.editToggle;

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

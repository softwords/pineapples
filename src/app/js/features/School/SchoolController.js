


(function () {

    var ctrlr = function ($scope, $rootScope, api, $stateParams, $state, schoolData) {

        // read application from its id
        this.Title = "School Details";

        this.School = {};
        this.SchoolInit = {};
        this.hasChange = false;

        this.NavigateId = $stateParams.id;              // assume we always pass id?


        this.OnDataCommit = function () {
            alert('Saved');
            angular.copy(this.School, this.SchoolInit);
        }

        this.OnDataRollback = function () {
            angular.copy(this.SchoolInit, this.School);
        }

        this.exportData = function () {
            var blob = new Blob([document.getElementById('exportable').innerHTML], {
                type: "data:text/csv;utf-8"
            });
            saveAs(blob, "Report.csv");
        }

        var self = this;


        $scope.$on('DataRollback', function (e) {
            self.OnDataRollback();
        });

        $scope.$on('DataCommit', function (e) {
            self.SaveApp();
        });

        this.SaveApp = function () {
            var self = this;
            self.School.$save().$promise.then(
                // return pack is an object with
                // data, headers, config, status and statustext
                     function (returnPack) {

                         //self.School = returnPack.data.School;
                         angular.copy(self.School, self.SchoolInit);
                         //self.summary = returnPack.data.summary;
                         self.hasChange = true;
                         //$scope.$apply();
                     },
                     // error
                     function () {
                         alert("Sorry, there was a problem!");
                     }
                );

        }

        self.School = schoolData.ResultSet[0][0];          // single row is returned as a 1 element array when we retrn DataTable
        self.School.Surveys = schoolData.ResultSet[1];
        self.School.LatestSurvey = self.School.Surveys[self.School.Surveys.length - 1]; // single row is returned as a 1 element array when we retrn DataTab
        angular.copy(self.School, self.SchoolInit);
   
        self.School.LatestSurvey = _.findLast(self.School.Surveys, function (s) { return (s.ssEnrol > 0 ? true : false);})
    };

    angular
        .module('pineapples')
        .controller('SchoolController', ['$scope', '$rootScope', 'schoolsAPI', '$stateParams', '$state', 'data', ctrlr])

})();
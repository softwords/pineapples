/*
*** FormTools

handles Save/Undo Handler logic

*/
(function () {


    var ctrlr = function ($scope, $attrs) {
        this.init = function (form) {
            $scope.theForm = form;
        }

        this.CancelCaption = function () {
            return ($scope.theForm.$dirty ? 'Cancel' : 'Close');
        };

        $scope.cancel = function () {
            if ($scope.theForm.$dirty) {
                $scope.$emit('DataRollback');
                $scope.theForm.$setPristine();
            } else {
                $scope.$emit('ModalClose');
            };
        };
        $scope.save = function () {
            if ($scope.$emit('DataCommit')) {
                $scope.theForm.$setPristine();
            };
        }

    };


    angular
        .module('sw.common')
        .controller('FormTools', ['$scope', '$attrs', ctrlr]);
})();

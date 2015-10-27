/*
Common formatting  filters
*/
(function () {
    var checkmark = function (value) {

        if (value == null || value == '')
            return '';
        return value ? '\u2713' : '\u2718';
    };
    var block = function (value) {

        if (value == null || value == '')
            return '';
        return value ? '\u25A0' : '';
    };
    var z0 = function (value) {
        if (value) {
            return value;
        }
        return '';
    }
    var percentage = function ($window) {
        return function (input, decimals, suffix) {
            decimals = angular.isNumber(decimals) ? decimals : 3;
            suffix = suffix || '%';
            if ($window.isNaN(input)) {
                return '';
            }
            return Math.round(input * Math.pow(10, decimals + 2)) / Math.pow(10, decimals) + suffix
        };
    };
    var percif=  function ($window, $filter) {
                return function (input, conditional, decimals, suffix) {
                    decimals = angular.isNumber(decimals) ? decimals : 3;
                    suffix = suffix || '%';
                    if ($window.isNaN(input)) {
                        return '';
                    }
                    if (conditional)
                        return Math.round(input * Math.pow(10, decimals + 2)) / Math.pow(10, decimals) + suffix;
                    else
                        return $filter('number')(input, decimals);
                };
            };
    angular
        .module('sw.common')
            .filter('checkmark', function () { return checkmark; })
            .filter('block', function () { return block; })
            .filter('z0', function () { return z0; })
            .filter('percentage', ['$window', percentage])
            .filter('percif', ['$window', '$filter', percif]);
})();
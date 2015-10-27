(function () {

    //----------------------
    // Restangular config
    // ------------------
    // the base Url 'api' confirms to the web api convention that web api calls
    // are routed under 'api'
    // This allows web api calls to be distinguished from mvc calls

    function restangularConfig(RestangularProvider) {
        // base url is api - this is web api 2 convention
        RestangularProvider.setBaseUrl('api');
    };

    angular
        .module('sw.common')
        .config(['RestangularProvider', restangularConfig]);
})();
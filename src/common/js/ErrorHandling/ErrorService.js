; (function () {

    var fct = function ($rootScope, $state, $auth, pnotify) {
    // service definition
        var svc = {
            catch: fcatch,
            catchRest: rcatch
        }
        return svc;
    // implementation
        function fcatch(error) {
            // what does this error look like?
            if (error.status != undefined) {

                switch (error.status)
                {
                    case 401:
                        handle401(error);
                        return;
                    case 404:
                        // not found, in this context, probably means a routing failure
                        handleHttp(error);
                        return;
                    case 500:
                        handle500(error);
                        return;
                    case 502:
                        // connection fail
                        handle502(error);
                }

            }
            var args = {
                title: 'An error occurred',
                text: error,
                type: 'error'

            }
            pnotify.notify(args)
        };
        function handle401() {
            // probably should try to validate the existing token?
            // go back to signin
            $state.go('signin');
        }
        function handle500(error) {
            // error here is structered json reporting the web api exception
            // lots of info in there, of litle use to the end user
            var args = {
                title: error.statusText,
                text: error.data.Message,
                type: 'error'

            }
            pnotify.notify(args)
        }
        function handle502(error) {
            // error here is structered json reporting the web api exception
            // lots of info in there, of litle use to the end user
            var args = {
                title: error.statusText,
                text: error.data.Message,
                type: 'error'

            }
            pnotify.notify(args)
        }
        function handleHttp(error) {
            // error here is structered json reporting the web api exception
            // lots of info in there, of litle use to the end user
            var args = {
                title: error.statusText + ' (' + error.status + ')',
                text: error.data.Message,
                type: 'error'

            }
            pnotify.notify(args)
        }
        function rcatch(restError) {
            // this processes a rest error as returned by restangular

        }

    };

    angular
        .module('sw.common')
        .factory('ErrorService', ['$rootScope','$state','$auth','pinesNotifications',fct]);


})();
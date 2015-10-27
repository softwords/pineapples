(function () {

  
    // NgTokenAuth configuration allows customisation of the messages sent to and recieved from the 
    // authorization provider, in this case ASP.NET Identity

    function ngTokenAuthConfig($authProvider) {

        // ng-token-auth config
        //



        // the following shows the default values. values passed to this method
        // will extend the defaults using angular.extend
        // this has to be customised to suit the format sent back by Win Api 2
        // Here's a sample
        //
        /* 
    
        {
            "access_token":"DcEP4kPoUg2zEFZm2TDmjO3hbGKxyPuIvtqmQXTkWNBXZ9uMpIvd3tbOB1T6WL4jMt4ERX-U-ev67x2_rjXUM0V4Spq_i8nMKK5eB2WlUFd3xIhmzfGILBkkCyXeyblzkaRw9BEu6jXbzuOkhukOhOw9_0uuYK1FCnItJvKAkwrUbXFUErwvfTKG8zfUiux8KtIwUmP2NLspuA3k4sQ2zzDAnj9pvipxB-wVzL0zZOGW7YlLt6hw8J5pBge2R-EvUT6gJAA9XEdXiJkNGzRmFnV4SeOlJhCAM9U-hkkfTVTHNoSQu4QIJLO-9yX4cwhmcC26yK_0RT17ZXfML6L-37yvpjtFY2ShbeiyB94o2T9viGV0MGmvpfAFwJEE-l05PGcQd6WtciK8Hu53qYmiGMM8H6UbQiHKVMcOe6gavlufUyxSovjH76CSCIrZNVTODqshQe_eAyis41hEkOpDx50eAmuQY9uZYLluZaWqpvdnog6e9yZsiq9l-8T9s3G5SSNYlUNTIAYpG-mlHZVZmMJArUi76M7KV83n7LRlnPE",
            "token_type":"bearer",
            "expires_in":1209599,
            "userName":"brian@softwords.com.au",
            "roles":"DFAT.POST",
            ".issued":"Thu, 13 Nov 2014 21:16:12 GMT",
            ".expires":"Thu, 27 Nov 2014 21:16:12 GMT"
        }
    
    
        */
        $authProvider.configure({
            apiUrl: 'api', //'/api',
            tokenValidationPath: '/Account/UserInfo',
            signOutUrl: '/Account/Logout',
            emailRegistrationPath: '/auth',
            accountUpdatePath: '/auth',
            accountDeletePath: '/auth',
            confirmationSuccessUrl: window.location.href,
            passwordResetPath: '/auth/password',
            passwordUpdatePath: '/Account/ChangePassword',
            passwordResetSuccessUrl: window.location.href,
            emailSignInPath: '/Token',
            storage: '?',
            proxyIf: function () { return false; },
            proxyUrl: '/proxy',
            authProviderPaths: {
                github: '/auth/github',
                facebook: '/auth/facebook',
                google: '/auth/google'
            },
            tokenFormat: {
                // the token expected by Win Api
                // this is set up to be the data that gets persisted.... only Authorization will get passed along to server
                Authorization: "Bearer {{token}}",
                Token: "{{token}}",               // just stash this so its easy to get again
                Expiry: "{{expiry}}"

            },
            parseExpiry: function (keyvalues) {
                // we get back the full data string from Win Api

                return (Date.parse(keyvalues['Expiry'])) || null;
            },
            handleLoginResponse: function (response) {
                return {
                    auth_token: response.access_token,
                    uid: response.userName,
                    expiry: response[".expires"],
                    roles: response.roles.split(","),
                    menu: JSON.parse(response.menu),
                    home: response.home
                }

            },
            handleAccountResponse: function (response) {
                return {
                    auth_token: response.access_token,
                    uid: response.userName,
                    expiry: response[".expires"],
                    roles: response.roles.split(","),
                    menu: JSON.parse(response.menu),
                    home: response.home
                }
            },
            handleTokenValidationResponse: function (response) {
                return {
                    // auth_token: response.access_token,
                    uid: response.Email,
                    roles: response.Roles,              // in this case it is returned as an array, not a string
                    menu: JSON.parse(response.menu),
                    home: response.home
                }
            }
        });
    };

angular
  .module('sw.common')
  .config(['$authProvider', ngTokenAuthConfig]);
})();
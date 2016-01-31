/*global al */

//file: factories/HttpFactory.js

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies
 *      alight,
 *      jQuery
 * @factory HttpFactory
 */
    
(function () {
    var http = al.service('HttpService');
    
    al.factory('HttpFactory', function ($scope) {
        
        var config = {
                baseUrl: '',
                onRequest:  function(){},
                onResponse: function(){}
            };
            
        return al.observable({
            config: function (cfg) {
                config.baseUrl   = cfg.baseUrl    || config.baseUrl;
                config.onRequest = cfg.onRequest  || config.onRequest;
                config.onResponse= cfg.onResponse || config.onResponse;
            },            
            get: function (url, data, next) {
                request(url, data, next, 'get');
                return this;
            },
            post: function (url, data, next) {
                request(url, data, next, 'post');
                return this;
            },
            put: function (url, data, next) {
                request(url, data, next, 'put');
                return this;
            },
            delete: function (url, data, next) {
                request(url, data, next, 'delete');
                return this;
            }
        }, $scope);
        
        function request(url, data, next, method){
            if( url.split(":")[0]!=='http' )
                url = config.baseUrl+url;
            
            next = next || $.noop();
            config.onRequest(data, url, method);
            http[method](url, data, function(resp, error){
                response(url, method, resp, error, next);
            });
        }
        
        function response(url, method, resp, error, next){
            config.onResponse(resp, error, url, method);
            next(resp, error);
            http.emit(error ? 'error' : 'success', [resp]);
            $scope.$scan();
        }
    });

}());


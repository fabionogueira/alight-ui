/*global al */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10, jQuery 1.x
 * @service HttpService
 */
    
(function () {

    al.service('HttpService', function () {
        var config = {
                baseUrl: '',
                onRequest: function(){},
                onResponse: function(){}
            },
            http;
        
        http = al.observable({
            config: function (cfg) {
                config.baseUrl   = cfg.baseUrl    || config.baseUrl;
                config.onRequest = cfg.onRequest  || config.onRequest;
                config.onResponse= cfg.onResponse || config.onResponse;
            },
            get: function (url, data, next) {
                request(url, data, next, 'GET');
                return this;
            },
            post: function (url, data, next) {
                request(url, data, next, 'POST');
                return this;
            },
            put: function (url, data, next) {
                request(url, data, next, 'PUT');
                return this;
            },
            delete: function (url, data, next) {
                request(url, data, next, 'DELETE');
                return this;
            }
        });
        
        return http;
        
        function request(url, data, next, method){
            
            next = next || noop;
            config.onRequest(data);
            
            $.ajax({
                type: method,
                url: config.baseUrl + url,
                data: data,
                success: function(resp){
                    response(resp, resp.status !== 200, next);
                },
                error: function(resp){
                    response(resp, true, next);
                }
            });
            
        }
        function response(resp, error, next){
            config.onResponse(resp, error);
            next(resp, error);
            http.emit(error ? 'error' : 'success', [resp]);
        }
        function noop(){}
    });

}());


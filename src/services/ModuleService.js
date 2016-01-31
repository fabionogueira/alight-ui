/*global alight, al, f$ */

//file: services/ModuleService.js

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies
 *      alight
 *      jQuery
 * @service ModuleService
 */

(function(){
    var MODULES={}, scriptCache = {}, htmlCache = {}, config = {base: ''}, registered = {},        
        HEAD = document.getElementsByTagName('head')[0];
    
    al.service('ModuleService', function () {
        var ModuleService = {
            config: function (cfg) {
                config = cfg;
                return this;
            },
            register: function (name, options) {
                if (options) {
                    options.name = name;
                    registered[name] = options;
                    return this;
                }
                return registered[name];
            },
            
            /**
             * Carrega um módulo e suas dependências
             * @memberOf ModuleService
             * @example
             *      1. ModuleService.load('module1', {viewUrl:'myView.html', controller:'myController', imports:['myController.js']});
             *      2. ModuleService.register('module1', {viewUrl:'myView.html', controller:'myController', imports:['myController.js']});
             *         ModuleService.load('module1', function(module){ console.log('my module is loaded') }); 
             * @param {String} name nome do módulo
             * @param {Object} options (opcional) opções como viewUrl, imports e controller do módulo a ser carregado
             * @param {Function} next (opcional) função a ser chamada quando o módulo e suas dependências forem carregados
             * @returns {ModuleService}
             */
            load: function(name, options, next) {
                var frag, dependencies;

                if (f$.isFunction(options)){
                    next = options;
                    options = registered[name];
                }

                if (MODULES[name]) {
                    return next(MODULES[name]);
                }

                frag = document.createElement('div');
                dependencies = [];

                if (options.viewUrl) {
                    dependencies.push(options.viewUrl);
                }
                if (options.imports) {
                    dependencies = dependencies.concat(options.imports);
                }
                if (options.onStartLoad){
                    options.onStartLoad();
                }
                
                //carrega todas as dependências do módulo
                loadAll(dependencies, function (result) {
                    var viewHtml, controller = al.controller(options.controller);

                    if (!options.view) {
                        viewHtml = result[options.viewUrl] ? result[options.viewUrl].data : null;
                        if (viewHtml) {
                            frag.innerHTML = viewHtml;
                            options.view = frag.firstChild;
                        }
                    }

                    if (options.view) {
                        if (controller) {
                            var scope = alight.Scope();

                            scope.$system.__factories = {};
                            scope.$system.__models = {};

                            al.__processingModuleScope = scope;
                            al.__processingModuleView = options.view;

                            scope.$Component = {};
                            initController(scope, controller, options.view);

                        } else if (options.scope) {
                            al.__processingModuleScope = options.scope;
                            al.__processingModuleView = options.view;

                            alight.applyBindings(options.scope, options.view);
                        }
                    }

                    MODULES[name] = options;

                    if (next) {
                        if (options.onLoaded){
                            options.onLoaded();
                            setTimeout(next, 600);
                        }else{
                            next();
                        }
                    }
                });
                
                return this;
            }
        };
        
        return ModuleService;
    });
    
    function initController(scope, controller, view) {
        alight.applyBindings(scope, view);
        al.injector(scope, controller);
        scope.$scan();
    }
    
    function loadScript(url, next) {
        var script;

        if (scriptCache[url]) {
            return next(url, scriptCache[url]);
        }

        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        scriptCache[url] = 'pending';

        script.onload = script.onreadystatechange = function () {
            this.complete('success');
        };
        script.onerror = function () {
            this.complete('error');
            HEAD.removeChild(this);
        };
        script.complete = function (status) {
            this.complete = this.onload = this.onerror = null;
            scriptCache[this.url] = status;
            next(url, status);
        };

        HEAD.appendChild(script);
    }
    function loadHtml(url, next) {

        if (htmlCache[url]) {
            return next(url, htmlCache[url].status, htmlCache[url].html);
        }

        htmlCache[url] = {status: 'pending', html: ''};

        $.get(url)
                .done(function (html) {
                    htmlCache[url].status = 'success';
                    htmlCache[url].html = html;
                    next(url, 'success', html);
                })
                .fail(function () {
                    htmlCache[url].status = 'error';
                    next(url, 'error', '');
                });
    }
    function loadAll(dependencies, next) {
        var i, t={}, url, pendings = 0, result = {};

        if (dependencies.length === 0) {
            return next(result);
        }

        for (i = 0; i < dependencies.length; i++) {
            url = dependencies[i];
            t[pendings] = url.indexOf('.js') > 0 ? 'js' : 'html';
            pendings++;

            (t[pendings-1] === 'js' ? loadScript : loadHtml)(url, callback);
        }
        
        function callback(url, status, data) {
            result[url] = {
                type: t[pendings],
                data: data,
                status: status
            };

            pendings--;

            if (pendings === 0) {
                next(result);
            }
        }
    }
}());


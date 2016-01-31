/*global alight, f$, Function */

/**
 * @namespace al
*/
var al = {};

alight.autostart = false;
alight.directives.ng = alight.directives.al;
alight.directives.ui = {};

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10, jQuery 1.x
 * @function al.observable
 */
(function () { 
    /**
     * Injeta os métodos on e emit em um objeto permitido que sejam manipulados eventos customizados
     * @class al.observable
     * @param {Object} obj
     * @param {Object} context
     * @returns {Object}
     */
    al.observable = function (obj, context) {
        if (!obj.$_observable_listeners) {
            obj.$_observable_listeners = {};
            obj.$_observable_context = context;
            obj.emit = emit;
            obj.on = on;
        }
        return obj;
    };
    
    /**
     * @memberOf al.observable
     * @function
     * @param {String} event
     * @param {Array} args
     * @param {Object} context
     */
    function emit(event, args, context) {
        var i, listeners = this.$_observable_listeners[event];

        if (listeners) {
            args = f$.isArray(args) ? args : [args];
            for (i = 0; i < listeners.length; i++) {
                listeners[i].apply(context || this.$_observable_context || this, args);
            }
        }
    }
    
    /**
     * @memberOf al.observable
     * @function
     * @param {String} event
     * @param {Function} cb
     * @returns {al.observable}
     */
    function on(event, cb) {
        var listeners = this.$_observable_listeners;

        if (!listeners[event]) {
            listeners[event] = [];
        }
        listeners[event].push(cb);

        return this.$_observable_context || this;
    }
}());

//al.controller, al.service, al.factory, module
(function () {
    var MODELS, CONTROLLERS, SERVICES, FACTORIES, MODULES, PLUGINSEVENTS, STRIP_COMMENTS_AND_SPACES;
    
    MODELS = {};
    CONTROLLERS = {};
    FACTORIES = {};
    SERVICES = {};
    MODULES = {};
    PLUGINSEVENTS = {};
    STRIP_COMMENTS_AND_SPACES = /((\/\/.*$)|(\/\*[\s\S]*?\*\/)| )/mg;
    
    al.controller = function (ctrlName, fn) {
        if (!fn) {
            return CONTROLLERS[ctrlName];
        }
        CONTROLLERS[ctrlName] = fn;
        return this;
    };
    al.service = function (name, fn) {
        if (!fn) {
            return SERVICES[name];
        }

        SERVICES[name] = al.observable(fn());

        return this;
    };
    al.factory = function (name, fnOrScope) {
        if (!fnOrScope){
            return null;
        }
        
        if (FACTORIES[name] && fnOrScope.$system) {
            if (!fnOrScope.$system.__factories[name]){
                fnOrScope.$system.__factories[name] = new FACTORIES[name](fnOrScope);
            }
            
            return fnOrScope.$system.__factories[name];
        }
        if (typeof (fnOrScope) === 'function') {
            FACTORIES[name] = fnOrScope;
            return this;
        }
        
        return null;
    };
    al.injector = function(scope, fn){
        var arrParams, arrValues;

        arrParams = fn.toString()
                .split('(')[1]
                .split(')')[0]
                .replace(STRIP_COMMENTS_AND_SPACES, '')
                .split(',');

        //transforma o array de nomes de parametros em seus respectivos valores
        arrValues = nameToObject(scope, arrParams);

        //chama a função
        return fn.apply(scope, arrValues);
        
        function nameToObject(scope, name) {
            var
                i, a, v, o = null;

            if (f$.isArray(name)) {
                a = [];
                for (i = 0; i < name.length; i++) {
                    v = nameToObject(scope, name[i]);
                    if (v) {
                        a.push(v);
                    }
                }
                return a;
            }

            if (name==='$scope') {
                o = scope;
            }else{
                o = al.controller(name) || al.service(name) || al.factory(name, scope) || al.model(name, scope) || null;
            }
            
            return o;
        }
    };
    al.model = function (name, definitionOrScope) {
        var scope, modelDefinition;
        
        if (!definitionOrScope){
            return null;
        }
        
        scope = definitionOrScope.$system ? definitionOrScope : null;
        modelDefinition = definitionOrScope;
        
        //inicialização
        if (MODELS[name] && scope){
            return scope.$system.__models ? modelInstance(name, scope) : null;
        }
        
        //definição
        MODELS[name] = modelDefinition;
        
        return al;
    };
    
    function modelInstance(name, scope){
        var i, field, instance, scopeDataModel, $name="$"+name;
        
        //se já existe uma instância do model no escopo, retorna a existente.
        if (scope.$system.__models[name]){
            return scope.$system.__models[name];
        }
        
        //inicializa o objeto que representa os dados do model no escopo, ex: $scope.$nomeDoModel = {field1:1, field2:""}
        scopeDataModel = {};
        
        //cria uma nova instância
        instance = f$.isFunction(MODELS[name]) ? al.injector(scope, MODELS[name]) : MODELS[name];
        if (!instance.$static) instance = alight.utils.clone(instance);
        
        //transforma o item validators de
        for (i in instance.fields) {
            field = instance.fields[i];
            
            field.name = i;
            
            //transforma o validator em objeto
            field.validator = validatorStringToObject(field);
            
            //define o valor inicial do campo definido no model
            scopeDataModel[i] = (field.value===undefined ? null : field.value);
        }

        //injeta a variável data como variável do escope: $scope.$nomeDoModel
        scope[$name] = scopeDataModel;
        
        //injeta algumas funções úteis na definição do model
        instance.setData = function(data){
            var i;
            
            for (i in this.fields){
                scopeDataModel[i] = data[i];
            }
            
            scope.$scan();
            
            return this;
        };
        instance.getData = function(){
            var i, d={};
            
            for (i in this.fields){
                d[i] = scopeDataModel[i];
            }
            
            return d;
        };
        instance.setValue = function(field, value){
            if (this.fields[field]){
                scopeDataModel[field] = value;
            }
            
            scope.$scan();
            
            return this;
        };
        
        //guarda a instância do model no escopo
        scope.$system.__models[name] = instance = al.observable(instance);

        return instance;
    }
    function validatorStringToObject(field){
        var i, parts, validators, validatorObj={};
        
        //transforma o validator do campo, de string para objeto
        validatorObj.type = field.type;
        if (field.validator){
            validators = field.validator.split('|');
            for (i=0; i<validators.length; i++){
                parts = validators[i].split(':');
                validatorObj[parts[0]] = parts[1];
            }
        }
        
        return validatorObj;
    }
    
    f$.ready(function () {
        var app = document.getElementsByTagName('app')[0];

        if (app) {
            al.appElement = app;
            al.service('ModuleService').load('main', {
                view: app,
                controller: 'indexController'
            });
        }
    });
}());

/**
 * @namespace al.ui
*/
al.ui = {};

/**
 * Registra uma diretiva do tipo atributo no formato ui-nomeDaDiretiva
 * @example
 *      alight.ui.register('button', function(properties, element, scope, env){
 *          var button;
 *          
 *          //properties = propriedades definidas:
 *          //                 no atribudo properties da tag (deve ser um JSON) ou
 *          //                 na tag filha <properties key1="value1" key2="value2" ...></properties>
 *          //element    = HTMLElement que contém a diretiva
 *          //scope      = escopo do módulo
 *          //env        = fornecida pelo alight
 *          
 *          //definindo os métodos públicos do button
 *          button = {
 *              caption: function(txt){
 *                  element.innerHTML = txt;
 *              }
 *          };
 *          
 *          if (properties.caption) button.caption(properties.caption);
 *          
 *          return button;
 *      });
 * @param {String} directiveName
 * @param {Function|Object} uiDefinition
 */
al.ui.register = function (directiveName, uiDefinition) {
            
    alight.directives.ui[directiveName] = {
        restrict: 'A',
        init: function (element, name, scope, env) {
            var componentInstance, properties,
                moduleScope = al.__processingModuleScope;

            properties = al.ui.propertiesToJson(element);
            if (uiDefinition.defaults){
                properties = $.extend({}, uiDefinition.defaults, properties);
            } 
            componentInstance = this.create(element, properties);

            if (moduleScope && name){
                componentInstance.$element = element;
                moduleScope.$Component[name] = componentInstance;
            }

            if (uiDefinition.owner !== false) {
                return {
                    owner: true
                };
            }
        },
        create: function(element, properties, scope, moduleScope, env){
            return al.observable(uiDefinition.create(properties, element, scope, env), moduleScope);
        }
    };        

};

/**
 * Retorna um json referente aos valores definidos no atributo properties ou na tag properties:
 * @example
 *      <div properties='{"key":"value"}'></div>
 *      <div>
 *          <properties key1="value1" key2="value2"></properties>
 *      </div>
 * @param {type} element HTMLElement
 * @returns {Object}
 */
al.ui.propertiesToJson = function (element) {
    var i, propertiesElement,
        json = {},
        attr = element.getAttribute('properties');

    if (attr){
        try{ json = JSON.parse(attr);}catch(_e){ json={}; }
    }else{
        propertiesElement = element.children[0];
        if (propertiesElement && propertiesElement.localName==='properties'){
            attr = propertiesElement.attributes;
            for (i = 0; i < attr.length; i++) {
                json[attr[i].name] = attr[i].value;
            }
        }
    }

    if (element.$properties){
        for (i in element.$properties){
            json[i] = element.$properties[i];
        }
        delete(element.$properties);
    }

    return json;
};

/**
 * Compila um template
 * Um template normalmente é um html mais pode ser qualquer texto
 * @example
 *      alight.ui.compileTemplate('<div class="p1">{{p2}}</div>', ['p1', 'p2']);
 *      //retorna: function(){return '<div class="'+(p1)+'">'+(p2)+'<div>'}
 *      alight.ui.compileTemplate('<div class="obj.p1">{{obj.p2+obj.p2}}</div>', ['obj']);
 *      //retorna: function(){return '<div class="'+(obj.p1)+'">' +(obj.p2+obj.p2)+'<div>'}
 * @param {String} template
 * @param {Array} params
 * @returns {Function}
 */
al.ui.compileTemplate = function (template, params) {
    var i, p = '', parts1, parts2, code = '';

    parts1 = template.split('}}');
    for (i = 0; i < parts1.length; i++) {
        parts2 = parts1[i].split('{{');
        if (parts2.length === 2) {
            code += (p + "'" + parts2[0] + "'+(" + parts2[1]) + ')';
        } else {
            code += (p + "'" + parts2[0] + "'");
        }
        p = '+';
    }

    params = params || [];
    params = params.concat('return ' + code + ';');

    return Function.apply(null, params);
};

/**
 * Retorna um texto contendo o conteúdo do comentário dentro de 'element'
 * O comentário deve iniciar com <!--@template
 * @param {HTMLElement} element
 * @returns {String}
 */
al.ui.getTemplate = function (element) {
    for (var n, s, i = 0; i < element.childNodes.length; i++) {
        n = element.childNodes[i];
        if (n.nodeName === "#comment" && n.nodeValue.substring(0, 9) === '@template') {
            s = n.nodeValue.replace('@template', '').replace(/\t/g, '').replace(/\n/g, '').replace(/  /g, ' ').trim();
            return s;
        }
    }

    return '';
};

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


/*global alight, al, f$ */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10, jQuery 1.x
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


/*global alight, moment, al, ENV */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10, jQuery 1.x
 * @service ValidatorService
 */

(function(){
    al.service('ValidatorService', function () {
        var validators = {};

        return {
            create: function(name, options){
                options.init = options.init || function(){};
                options.name = name;
                validators[name] = options;
                return this;
            },
            getValidator: function(name){
                return validators[name];
            },
            checkValue: function (value, fieldDefinition) {
                var result=[], validator, checker, r, i;
                
                fieldDefinition = fieldDefinition || {};
                validator = fieldDefinition.validator;
                
                for (i in validator){    
                    if ( (value==='' || value===null || value===undefined) && i!=='required'){
                        continue;
                    }
                    
                    checker = validators[i==='type'?validator[i]:i];
                    if (checker){
                        r = checker.check(value, validator);
                        if (r !== true){
                            result.push( messageCompiler(value, checker, fieldDefinition) );
                        }
                    }
                }
                
                return result;
            }
        };
        
        function messageCompiler(value, validator, fieldDefinition){
            var msg, mt, i;
            
            mt = 'message_' + fieldDefinition.type;
            msg= fieldDefinition['validatorMessage_'+validator.name] || fieldDefinition['validatorMessage_'+validator.name+'_'+fieldDefinition.type] || 
                 validator[mt] ||  validator.message;
            
            for (i in fieldDefinition){
                msg = msg.replace('{'+i+'}', fieldDefinition[i]);
            }
            
            //se não foi definido o label, substitui {label} pelo nome do campo
            msg = msg.replace('{label}', fieldDefinition.name);
            
            for (i in fieldDefinition.validator){
                msg = msg.replace('{'+i+'}', fieldDefinition.validator[i]);
            }
            
            return msg.replace('{value}', value);
        }
    });
    
    if (!ENV.validators) ENV.validators={};
    
    al.service('ValidatorService')
        .create('string', {
            message: ENV.validators.string_message || 'String data type error',
            check: function(fieldValue){
                return fieldValue===null || typeof (fieldValue) === 'string' ? true : false;
            },
            init: function(element, options){
                if (options.mask){
                    alight.directives.ng.mask.init(element, options.mask);
                }
            }
        })
        .create('integer', {
            message: ENV.validators.integer_message || 'Integer data type error',
            check: function(fieldValue){
                return !isNaN( Number(fieldValue) );
            }
        })
        .create('date', {
            message: ENV.validators.date_message || 'Data type error',
            check: function(fieldValue){
                return moment(fieldValue, ["DD/MM/YYYY"], true).isValid();
            },
            init: function(element, options){
                alight.directives.ui.datepicker.create(element);
                
                if (options.mask) {
                    alight.directives.ng.mask.init(element, options.mask);
                }
            }
        })
        .create('cpf', {
            message: '',
            check:function(cpf){
                var i, soma, resto;
                
                cpf = cpf.replace(/\.|\-|\s/g,'');
                soma = 0;
                
                if (cpf === "00000000000") return false;
                
                for (i=1; i<=9; i++) soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
                
                resto = (soma * 10) % 11;
                
                if ((resto === 10) || (resto === 11)) resto = 0;
                if (resto !== parseInt(cpf.substring(9, 10)) ) return false;
                
                soma = 0;
                
                for (i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
                resto = (soma * 10) % 11;
                if ((resto === 10) || (resto === 11)) resto = 0;
                if (resto !== parseInt(cpf.substring(10, 11) ) ) return false;
                
                return true;
            },
            init:function(element){
                alight.directives.ng.mask.init(element, '000.000.000-00');
            }
        })
        .create('required', {
            message: ENV.validators.required_message || 'Field is required',
            check: function(value){
                return !(value==='' || value===null || value===undefined);
            }
        })
        .create('email', {
            message: ENV.validators.email_message || 'Invalidate email',
            check: function(fieldValue, options){
                var PATTERN = /^[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
                return PATTERN.exec(fieldValue) ? true : false;
            }
        })
        .create('max', {
            message: ENV.validators.max_message || 'The value {value} invalid, max value is {max}',
            message_string: ENV.validators.max_message_string || 'The maximum length is {max}',
            check: function(fieldValue, options){
                return (1*fieldValue) <= (1*options.max);
            }
        })
        .create('min', {
            message: ENV.validators.min_message || 'The value {value} invalid, min value is {min}',
            message_string: ENV.validators.min_message_string || 'The minimum length is {min}',
            check: function(fieldValue, options){
                var min = 1*options.min;
                
                if (options.type==='string'){
                    return (fieldValue.length) >= min;
                }else{
                    return (1*fieldValue) >= min;
                }
            }
        })
        .create('size', {
            init: function(element, options){
                element.maxLength = options.size;
            }
        });
    
}());


/*global al */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10, jQuery 1.x
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


/*global alight */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10, jQuery 1.x
 * @directive al-name
 */
    
alight.directives.al.name = {
    restrict: 'A',
    init: function(element, name, scope){
        scope.$Component[name]=element;
        return {};
    }
};

/*global alight */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10
 * @directive al-disabled
 */

alight.directives.al.disabled = {
    init: function(element, name, scope, env) {
        var activeElement, activeUrl, child, initValue, self;

        child = null;
        activeElement = null;
        activeUrl = null;
        initValue = null;

        self = {
            start: function () {
                self.watchModel();                    
                return self.initUpdate();
            },
            updateDom: function (value) {
                value===false ? element.removeAttribute('disabled') : element.setAttribute('disabled', 'disabled');
            },
            watchModel: function () {
                var w;
                w = scope.$watch(name, self.updateDom, {
                    readOnly: true
                });
                return initValue = w.value;
            },
            initUpdate: function () {
                return self.updateDom(initValue);
            }
        };

        return self;
    }
};


/*global alight */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10
 * @directive al-hide
 */

alight.directives.al.hide = {
    init: function(element, name, scope, env) {
        var activeElement, activeUrl, child, initValue, self;

        child = null;
        activeElement = null;
        activeUrl = null;
        initValue = null;

        self = {
            start: function () {
                self.watchModel();                    
                return self.initUpdate();
            },
            updateDom: function (value) {
                value===false ? element.removeAttribute('hidden') : element.setAttribute('hidden', 'true');
            },
            watchModel: function () {
                var w;
                w = scope.$watch(name, self.updateDom, {
                    display: 'none'
                });
                return initValue = w.value;
            },
            initUpdate: function () {
                return self.updateDom(initValue);
            }
        };

        return self;
    }
};


/*global alight */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10, jQuery 1.x
 * @directive al-include-cache
 */

(function () {
    var include_cache = {};

    alight.directives.al.includeCache = function () {
        var self = alight.directives.al.include.init.apply(null, arguments);

        self.loadHtml = function (cfg) {
            var pr = include_cache[cfg.url];

            if (!pr) {
                include_cache[cfg.url] = pr = $.get(cfg.url);
            }
            if (cfg.success)
                pr.done(cfg.success);
            if (cfg.error)
                pr.fail(cfg.error);
        };

        return self;
    };
    
}());


/*global alight, al, f$ */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10
 * @directive al-module
 */
    
alight.directives.al.module = {
    priority: 100,
    init: function(element, name, scope, env) {
        var activeElement, activeUrl, child, initValue, self;

        child = null;
        activeElement = null;
        activeUrl = null;
        initValue = null;

        self = {
            owner: true,
            topElement: null,
            start: function () {
                self.watchModel();                    
                return self.initUpdate();
            },
            insertModule: function (module){
                if (activeElement){
                    //child.$destroy();
                    f$.remove(activeElement);
                }

                activeElement = module.view;
                child = module.scope;
                element.appendChild(activeElement);
            },
            updateDom: function (objOrStr) {
                if (!objOrStr) {
                    if (activeElement){
                        f$.remove(activeElement);
                    }
                    return;
                }

                objOrStr.scope = objOrStr.scope || scope;
                al.service('ModuleService').load(objOrStr.name, objOrStr, self.insertModule);
            },
            watchModel: function () {
                var w;
                w = scope.$watch(name, self.updateDom, {
                    readOnly: true
                });
                return initValue = w.value;
            },
            initUpdate: function () {
                return self.updateDom(initValue);
            }
        };

        return self;
    }
};
    


/*global alight, al */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10, jQuery 1.x, jQuery Mask Plugin v1.13.4 [github.com/igorescobar/jQuery-Mask-Plugin]
 * @directive al-model
 */

(function(){
    var validatorService = al.service('ValidatorService');
    
    //ng-model
    alight.directives.al.model = function (element, name, scope) {
        var parts, model, modelName, dataModelName, field, self;
        
        if (!scope.$system.__modelErrorDirectiveElements){
            scope.$system.__modelErrorDirectiveElements = {};
        }
        
        if (element.type || element.nodeName==="SELECT" || element.nodeName === "TEXTAREA"){
            //<input type=radio>                      ::herança de al-radio
            if(element.type==='radio'){
                self = alight.directives.al.radio.init.apply(null, arguments);
            }
            //<input type=checkbox>                   ::herança de al-checked
            else if (element.type==='checkbox'){
                self = alight.directives.al.checked.init.apply(null, arguments);
            }
            //<input type=text>, <select>, <textarea> ::herança de al-value
            else{
                self = alight.directives.al.value.apply(null, arguments);
            }
            self.updateDom_ = self.updateDom;
            self.updateDom = function (value){
                self.fieldChanged(value);
                return self.updateDom_(value);
            };
        }
        
        self.fieldChanged = function(value, custom){
            var a;
            
            if (self.changing_) {
                self.changing_ = false;
                return;
            }
            
            scope[dataModelName][field] = value;
            
            a = validateModel(model, scope[dataModelName], function(fieldName, errors){
                if (fieldName===field){
                    setElementValidateStatus(element, scope, name, errors);
                }
            });
            
            scope[dataModelName]['$VALIDATE']  = a[0];
            scope[dataModelName]['$EDIT_MODE'] = a[1];
            
            setTimeout(function(){
                self.changing_ = true;
                scope.$scan(function(){
                    self.changing_ = false;
                });                
            },10);
        };
        
        $(element).on('customChange', function(){
            self.fieldChanged(this.value, true);
        });
        
        parts         = name.split('.');
        modelName     = parts[0].substring(1);
        field         = parts[1];
        model         = al.model(modelName, scope);
        dataModelName = '$'+modelName;
        
        if (model){
            initFieldValidator(model.fields[field], element);
        }
        
        return self;
    };
    
    function initFieldValidator(field, element){
        var validator;
        
        if (field){
            validator = validatorService.getValidator(field.type);
            if (validator) validator.init(element, field);
            if (field.size) validatorService.getValidator('size').init(element, field);
        }
    }
    function validateModel(model, dataModel, fn){
        var i, r, valid=true, mode='new';

        //valida os campos do model
        for (i in dataModel){

            if (model.fields[i]){
                r = validatorService.checkValue(dataModel[i], model.fields[i]);
                
                //se o campo é chave primária
                if (model.fields[i].key && dataModel[i]){
                    mode='edit';
                }
                
                if (r.length===0){
                    fn(i);
                }else{
                    valid=false;
                    fn(i, r);
                }
            }
        }

        return [valid, mode];
    }
    function setElementValidateStatus(element, scope, name, errors){
        var sys = scope.$system, elErr;
        
        if (sys.__modelErrorDirectiveElements){ 
            if (sys.__modelErrorDirectiveElements[name]){
                elErr = sys.__modelErrorDirectiveElements[name];
            }else{
                sys.__modelErrorDirectiveElements[name] = element;
            }
        }
        
        if (errors){
            element.setAttribute(alight.directives.al.modelError.ATTR_MODEL_ERROR, errors.join('|') );
            if (elErr){
                elErr.innerHTML = errors.join('|');
            }            
        }else{
            element.removeAttribute(alight.directives.al.modelError.ATTR_MODEL_ERROR);
            if (elErr){
                elErr.innerHTML = '';
            }
        }
    }
}());


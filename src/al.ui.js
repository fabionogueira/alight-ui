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

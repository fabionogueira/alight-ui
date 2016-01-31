/*global alight, al, f$ */

//file: directives/al-module.js

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies
 *      alight
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
    


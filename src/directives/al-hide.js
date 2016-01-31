/*global alight */

//file: directives/al-hide.js

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies
 *      alight
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


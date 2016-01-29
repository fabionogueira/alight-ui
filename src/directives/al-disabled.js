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


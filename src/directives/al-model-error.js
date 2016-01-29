/*global alight */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10, jQuery 1.x, jQuery Mask Plugin v1.13.4 [github.com/igorescobar/jQuery-Mask-Plugin]
 * @directive al-model-error
 * @param {HTMLElement} element
 * @param {String} name
 * @param {Object} scope
 */

alight.directives.al.modelError = function (element, name, scope) {
    var sys = scope.$system;

    if (!sys.__modelErrorDirectiveElements){
        sys.__modelErrorDirectiveElements = {};
    }

    if (sys.__modelErrorDirectiveElements[name]){
        element.innerHTML = sys.__modelErrorDirectiveElements[name].getAttribute(alight.directives.al.modelError.ATTR_MODEL_ERROR);
    }

    scope.$system.__modelErrorDirectiveElements[name] = element;
};

alight.directives.al.modelError.ATTR_MODEL_ERROR = 'data-model-error';

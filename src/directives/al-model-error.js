/*global alight */

//file: directives/al-model-error.js

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies
 *      alight
 * @directive al-model-error
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

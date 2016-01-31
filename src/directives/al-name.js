/*global alight */

//file: directives/al-name.js

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies
 *      alight
 * @directive al-name
 */
    
alight.directives.al.name = {
    restrict: 'A',
    init: function(element, name, scope){
        scope.$Component[name]=element;
        return {};
    }
};

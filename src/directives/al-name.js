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

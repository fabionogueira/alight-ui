/*global alight */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies
 *      alight,
 *      jQuery,
 *      jQuery Mask Plugin
 *      
 * @directive al-mask
 */

alight.directives.al.mask = {
    restrict: 'A',
    init: function(element, mask, scope){
        var jq = $(element);

        element.placeholder = mask.replace(/[09AZS]/g, '_');

        jq.mask(mask, {
            onChange: function(){
                jq.trigger('customChange');
            }
        });            
    }
};

/*global al, ENV */

//datepicker for bootstrap
(function () {
    
    var defaultProperties={
            todayHighlight: true,
            language      : 'ptBR',
            autoclose     : true
    };
        
    $.fn.datepicker.dates.ptBR = ENV.i18n.dates;
    
    al.ui.register('datepicker', function (properties, element, scope, env) {
        var instance;
        
        properties = $.extend({}, defaultProperties, properties);
        
        $(element).datepicker(properties)
            .on('changeDate', function () {
                $(this).trigger('customChange');
                instance.emit('changeDate');
            });
        
        //global methods
        instance = {
            
        };
        
        return instance;
        
    }, false);

}());

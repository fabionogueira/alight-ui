/*global al, ENV */

//datepicker for bootstrap
(function () {
    
    $.fn.datepicker.dates.ptBR = ENV.i18n.dates;
    
    al.ui.register('datepicker', {
        defaults: {
            todayHighlight: true,
            language      : 'ptBR',
            autoclose     : true
        },
        owner: false,
        create: function (properties, element, scope, env) {
            var instance;
            
            $(element).datepicker(properties)
                .on('changeDate', function () {
                    $(this).trigger('customChange');
                    instance.emit('changeDate');
                });

            //global methods
            instance = {

            };

            return instance;

        }
    });
    
}());

/*global al */

//ui-modal
(function () {

    al.ui.register('modal', {
        owner: false,
        create:function (properties, element, scope, env) {
            var jQ=$(element).modal({show:false,backdrop:'static'});

            return {
                show: function(){
                    jQ.modal('show');
                },
                hide: function(){
                    jQ.modal('hide');
                }
            };

        }
    });

}());


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

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


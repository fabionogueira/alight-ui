/*global al */

//tabs
(function () {

    al.ui.register('tabs', {
        owner:false,
        create:function (properties, element, scope, env) {
            $(element).tab();

            return {

            };
        }
    });

}());

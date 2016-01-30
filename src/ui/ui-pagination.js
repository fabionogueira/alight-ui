/*global al */

//pagination
(function () {
    
    al.ui.register('pagination', {
        owner:false,
        defaults:{
            totalPages: 10,
            visiblePages: 4
        },
        create:function (properties, element, scope, env) {
            var pagination = {};

            properties.onPageClick = function (event, page) {
                pagination.emit('change', [page]);
            };

            $(element).twbsPagination(properties);

            //global properties/methods
            return pagination;

        }
    });

}());


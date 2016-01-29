/*global al */

//pagination
(function () {
    var defaultProperties = {
        totalPages: 10,
        visiblePages: 4
    };
    
    al.ui.register('pagination', function (properties, element, scope, env) {
        var pagination = {};
        
        properties = $.extend({}, defaultProperties, properties);
        properties.onPageClick = function (event, page) {
            pagination.emit('change', [page]);
        };
        
        $(element).twbsPagination(properties);

        //global properties/methods
        return pagination;

    }, false);

}());


/*global alight */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10, jQuery 1.x
 * @directive al-include-cache
 */

(function () {
    var include_cache = {};

    alight.directives.al.includeCache = function () {
        var self = alight.directives.al.include.init.apply(null, arguments);

        self.loadHtml = function (cfg) {
            var pr = include_cache[cfg.url];

            if (!pr) {
                include_cache[cfg.url] = pr = $.get(cfg.url);
            }
            if (cfg.success)
                pr.done(cfg.success);
            if (cfg.error)
                pr.fail(cfg.error);
        };

        return self;
    };
    
}());


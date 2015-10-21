import _ from 'underscore';

export function controller(value) {
    return function decorator(target) {
        target.prototype.controller = value;
    };
}


//Router

export function route(routeName) {
    return function(target, name, descriptor) {
        if (!target.routes) {
            target.routes = {};
        }
        if (_.isFunction(target.routes)) {
            throw new Error('The route decorator is not compatible with a route method');
            return;
        }
        if (!routeName) {
            throw new Error('The route decorator requires an route string argument');
        }

        target.routes[routeName] = name;
        console.log(target.routes)
        return descriptor;
    };
}
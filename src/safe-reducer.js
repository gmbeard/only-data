const constants = require("./constants");

class CircularReferenceError extends Error { 
    constructor() {
        super("Circular reference detected");
    }
}

function identityReducer(key, value) {
    return value;
}

function propertyReducer(include) {
    return function(key, value) {
        if (key !== "" && include.indexOf(key) < 0)
            return;

        return value;
    };
}

function reducer(options) {

    const defaults = { errorOnCircularReference: true };
    options = options || defaults;

    /* If caller doesn't want circular reference protection then
     * just return their custom reducer (or the identity reducer) without
     * wrapping it with `safeReduce`...
     */
    if (options.disableCircularReferenceProtection) {
        if (Array.isArray(options.reducer))
            return propertyReducer(options.reducer);

        return options.reducer || identityReducer;
    }

    /* The caller can provide either a function, or an array of property
     * names to include (if input is an object)...
     */
    if (typeof options === "function" || Array.isArray(options)) {
        options = {
            ...defaults,
            reducer: options,
        };
    }

    if (Array.isArray(options.reducer))
        options.reducer = propertyReducer(options.reducer);

    return safeReduce(options);
}

function safeReduce(options) {
    let stack = [];

    return function(key, value, stage) {
        if (stage === constants.BEGIN_STAGE)
            stack.push(this);
        else if (stage === constants.END_STAGE)
            stack = stack.slice(0, stack.indexOf(this));

        if (key !== "" && stack.indexOf(value) >= 0) {
            if (options.indicateCircularWarnings)
                return { __circular: true };
            else if(options.errorOnCircularReference === true)
                throw new CircularReferenceError();
            else
                return { };
        }

        if (options.reducer)
            return options.reducer.bind(this)(key, value, stage);

        return value;
    };
}

module.exports = reducer;

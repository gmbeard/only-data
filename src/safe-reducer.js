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

    const defaults = { circularReferences: constants.CIRCULAR_ERROR };
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

function evaluateOptions(options) {

    if (options.errorOnCircularReference)
        options.circularReferences = constants.CIRCULAR_ERROR;
    else if(options.errorOnCircularReference === false)
        options.circularReferences = constants.CIRCULAR_EMPTY;

    if (options.indicateCircularWarnings)
        options.circularReferences = constants.CIRCULAR_INDICATE;

    if (options.circularReferences
        && typeof options.circularReferences === "string") {
        switch (options.circularReferences.toLowerCase()) {
            case "error":
                options.circularReferences = constants.CIRCULAR_ERROR;
                break;
            case "remove":
                options.circularReferences = constants.CIRCULAR_REMOVE;
                break;
            case "empty":
                options.circularReferences = constants.CIRCULAR_EMPTY;
                break;
            case "indicate":
                options.circularReferences = constants.CIRCULAR_INDICATE;
                break;
        }
    }

    return options;
}

function safeReduce(options) {
    let stack = [];

    options = evaluateOptions(options);

    return function(key, value, stage) {
        if (stage === constants.BEGIN_STAGE)
            stack.push(this);
        else if (stage === constants.END_STAGE)
            stack = stack.slice(0, stack.indexOf(this));

        if (key !== "" && stack.indexOf(value) >= 0) {
            if (options.circularReferences === constants.CIRCULAR_ERROR)
                throw new CircularReferenceError();
            else if (options.circularReferences === constants.CIRCULAR_EMPTY)
                return { };
            else if (options.circularReferences === constants.CIRCULAR_INDICATE)
                return { __circular: true };
            else
                return;
        }

        if (options.reducer)
            return options.reducer.bind(this)(key, value, stage);

        return value;
    };
}

module.exports = reducer;

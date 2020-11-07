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

    /* Use an "identity" reducer if one wasn't 
     * provided by the caller...
     */
    options = options || identityReducer;

    /* The caller can provide an array of property
     * names to include (if `data` is an object)...
     */
    if (Array.isArray(options)) {
        return safeReduce({
            errorOnCircularReference: true,
            reducer: propertyReducer(options),
        });
    }
    else if (typeof options === "function") {
        return safeReduce({
            errorOnCircularReference: true,
            reducer: options,
        });
    }
    else if (options.disableCircularReferenceProtection) {
        return options.reducer;
    }

    if (Array.isArray(options.reducer))
        options.reducer = propertyReducer(options.reducer);

    return safeReduce(options);
}

function safeReduce(options) {
    let stack = [];

    options = options || { };

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

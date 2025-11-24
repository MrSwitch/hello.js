ko.extenders = {
    'throttle': function(target, timeout) {
        // Throttles the evaluation of dependent observables and the writes to writable targets.

        // (1) Throttle the evaluations of dependent observables
        target['throttleEvaluation'] = timeout;

        // (2) Throttle writes to writable observables
        let writeTimeoutInstance = null;
        return ko.dependentObservable({
            'read': target,
            'write': function(value) {
                clearTimeout(writeTimeoutInstance);
                writeTimeoutInstance = ko.utils.setTimeout(function() {
                    target(value);
                }, timeout);
            }
        });
    },

    'rateLimit': function(target, options) {
        // Rate limits changes to the target observable, controlling the frequency of updates.

        let timeout, method, limitFunction;

        if (typeof options === 'number') {
            timeout = options;
        } else {
            timeout = options['timeout'];
            method = options['method'];
        }

        // Prevent deferred updates when rateLimit is active
        target._deferUpdates = false;

        // Choose the appropriate limiting function (debounce or throttle)
        limitFunction = method === 'notifyWhenChangesStop' ? debounce : throttle;

        // Apply the limit function to the target
        target.limit(function(callback) {
            return limitFunction(callback, timeout);
        });
    },

    'deferred': function(target, options) {
        // Enables deferred updates for the target observable. Throws error if 'true' isn't passed.

        if (options !== true) {
            throw new Error("The 'deferred' extender only accepts the value 'true', as it cannot be turned off once enabled.");
        }

        if (!target._deferUpdates) {
            target._deferUpdates = true;
            target.limit(function(callback) {
                let handle;
                return function() {
                    ko.tasks.cancel(handle);
                    handle = ko.tasks.schedule(callback);
                    target['notifySubscribers'](undefined, 'dirty');
                };
            });
        }
    },

    'notify': function(target, notifyWhen) {
        // Adjusts the target's equalityComparer function based on when it should notify subscribers.

        target["equalityComparer"] = notifyWhen === "always" ?
            null :  // null equalityComparer means always notify
            valuesArePrimitiveAndEqual;
    }
};

// Helper function to compare primitive values
function valuesArePrimitiveAndEqual(a, b) {
    const primitiveTypes = { 'undefined': 1, 'boolean': 1, 'number': 1, 'string': 1 };
    const oldValueIsPrimitive = (a === null) || (typeof(a) in primitiveTypes);
    return oldValueIsPrimitive ? (a === b) : false;
}

// Throttle function implementation to limit the frequency of function calls
function throttle(callback, timeout) {
    let timeoutInstance;
    return function() {
        if (!timeoutInstance) {
            timeoutInstance = ko.utils.setTimeout(function() {
                timeoutInstance = undefined;
                callback();
            }, timeout);
        }
    };
}

// Debounce function implementation to delay the invocation of the callback
function debounce(callback, timeout) {
    let timeoutInstance;
    return function() {
        clearTimeout(timeoutInstance);
        timeoutInstance = ko.utils.setTimeout(callback, timeout);
    };
}

// Applies the requested extenders to the target observable
function applyExtenders(requestedExtenders) {
    let target = this;
    if (requestedExtenders) {
        ko.utils.objectForEach(requestedExtenders, function(key, value) {
            const extenderHandler = ko.extenders[key];
            if (typeof extenderHandler === 'function') {
                target = extenderHandler(target, value) || target;
            }
        });
    }
    return target;
}

ko.exportSymbol('extenders', ko.extenders);

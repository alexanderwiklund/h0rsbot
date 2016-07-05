'use strict';

var exports = module.exports = {};

/* * * * * * * * * * *
 * Utility functions *
 * * * * * * * * * * */

//Handles the case where we want to use Promise.all() but let it run through all promises and not halt on first rejection.
exports.reflect = (promise) => {
	return promise.then((resolved) => ({result: resolved, status: 'resolved'}), (rejected) => ({result: rejected, status: 'rejected'}))
}

//Removes extra whitespace from multiline template strings.
exports.dedent = (callSite, ...args) => {
    function format(str) {
        let size = -1
        return str.replace(/\n(\s+)/g, (m, m1) => {
            if (size < 0) size = m1.replace(/\t/g, '    ').length
            return '\n' + m1.slice(Math.min(m1.length, size))
        })
    }
    if (typeof callSite === 'string') return format(callSite)
    if (typeof callSite === 'function') return (...args) => format(callSite(...args))

    let output = callSite
        .slice(0, args.length + 1)
        .map((text, i) => (i === 0 ? '' : args[i - 1]) + text)
        .join("")
    return format(output)
}

// Require Node.JS dependencies
const {
    access,
    readFile,
    constants: { R_OK }
} = require("fs");
const { join } = require("path");
const { promisify } = require("util");

// Require Third-party dependencies
const is = require("@sindresorhus/is");

const AsyncFS = {
    access: promisify(access),
    readFile: promisify(readFile)
};

/**
 * @async
 * @func viewRenderer
 * @desc Render and cache .html view!
 * @param {!String} dir root of view files
 * @param {Object=} [options={}] options
 * @param {Boolean} [disableCache=false] disable the cache
 * @returns {Function<Promise<String>>}
 */
function viewRenderer(dir, { disableCache = false } = {}) {
    const cache = new Map();
    if (!is.string(dir)) {
        throw new TypeError("dir argument should be typeof string");
    }

    return async function render(viewPath) {
        if (cache.has(viewPath) && !disableCache) {
            return cache.get(viewPath);
        }
        const cplDir = join(dir, viewPath);

        await AsyncFS.access(cplDir, R_OK);
        const htmlView = (await AsyncFS.readFile(cplDir)).toString();
        cache.set(viewPath, htmlView);

        return htmlView;
    };
}

module.exports = viewRenderer;

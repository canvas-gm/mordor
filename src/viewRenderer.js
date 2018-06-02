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

/**
 * ASYNCHRONOUS Wrapper for old Node FS methods
 */
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
 * @returns {render}
 *
 * @throws {TypeError}
 *
 * @example
 * const viewRenderer = require("./viewRenderer");
 * const view = viewRenderer("/views");
 *
 * // In your request
 * response.end(await view("index.html"));
 */
function viewRenderer(dir, { disableCache = false } = {}) {
    // Verify arguments...
    if (!is.string(dir)) {
        throw new TypeError("dir argument should be typeof string");
    }
    if (!is.boolean(disableCache)) {
        throw new TypeError("options.disableCache should be typeof boolean");
    }

    /**
     * @const cache
     * @desc View cache
     * @type {Map<String, String>}
     */
    const cache = new Map();

    /**
     * @async
     * @func render
     * @desc Retrieve stringified content of a given .html file!
     * @param {!String} viewPath view .html file name or path
     * @returns {Promise<String>}
     */
    async function render(viewPath) {
        // Check if we already have view in our cache
        if (cache.has(viewPath) || !disableCache) {
            return cache.get(viewPath);
        }
        const completeDirectoryPath = join(dir, viewPath);

        // Verify if we can read the file
        await AsyncFS.access(completeDirectoryPath, R_OK);

        // Read and setup the stringified content into the cache Map
        const htmlView = (await AsyncFS.readFile(completeDirectoryPath)).toString();
        cache.set(viewPath, htmlView);

        return htmlView;
    }

    return render;
}

// Export viewRenderer closure!
module.exports = viewRenderer;

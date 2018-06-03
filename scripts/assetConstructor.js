// Require Node.JS Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const is = require("@sindresorhus/is");
const inquirer = require("inquirer");

// Require Internal Dependencies
const { getJavaScriptFiles } = require("../src/utils");
const { green, yellow, blue, red } = require("chalk");

/**
 * @const Assets
 * @desc All available Assets has a map
 * @type {Map<String, Function<Promise<void>>}
 */
const Assets = new Map();

// Retrieve available assets!
{
    const modules = getJavaScriptFiles(join(__dirname, "assets")).map(require);
    for (const { name, handler } of modules) {
        console.log(blue(`Loading new asset with name: ${green(name)}`));
        Assets.set(name, handler);
    }
    console.log("");
}
if (Assets.size === 0) {
    console.log(yellow("Abording... No assets detected!"));
    process.exit(0);
}

/**
 * @func main
 * @returns {Promise<void>}
 */
async function main() {
    // Retrieve script arguments
    let [asset] = process.argv.slice(2);

    // If asset is not defined, ask user for asset input
    if (is.nullOrUndefined(asset)) {
        console.log(red("Missing script argument, please complete the following question"));
        const assetsArr = [...Assets.keys()];
        const { selectedAsset } = await inquirer.prompt([
            {
                type: "list",
                name: "selectedAsset",
                message: "Select an asset to build",
                choices: assetsArr,
                default: assetsArr[0]
            }
        ]);
        asset = selectedAsset;
    }

    console.log("");
    console.log(blue(`Executing asset with name: ${green(asset)}`));
    const handler = Assets.get(asset);
    await handler();
}
main().catch(console.error);


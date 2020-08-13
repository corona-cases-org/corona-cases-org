const path = require("path");
const fs = require("fs");
const Rollup = require("broccoli-rollup");
const rollupCJS = require("@rollup/plugin-commonjs");
const rollupNode = require("@rollup/plugin-node-resolve").default;
const babelRollup = require("@rollup/plugin-babel").default;
const rollupJSON = require("@rollup/plugin-json")
const rollupReplace = require("@rollup/plugin-replace")
const Pug = require("broccoli-pug2");
const AssetRev = require("broccoli-asset-rev");
const Funnel = require("broccoli-funnel");
const MergeTrees = require("broccoli-merge-trees");
const BroccoliSass = require("broccoli-sass-source-maps");
const BroccoliCleanCss = require("broccoli-clean-css");
const BroccoliUglify = require("broccoli-uglify-sourcemap");
const CachingPlugin = require("broccoli-caching-writer");
const { UnwatchedDir } = require("broccoli-source");
const glob = require("glob");
const mkdirp = require("mkdirp");

function rollupPlugins() {
  return [
    rollupNode(),
    rollupReplace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    rollupCJS({
      include: /node_modules/,
    }),
    babelRollup({
      babelHelpers: "bundled",
      babelrc: false,
      presets: [
        [
          "@babel/env",
          {
            modules: false,
            targets: {
              browsers: ["since 2012"]
            }
          }
        ]
      ],
      plugins: [
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread",
        "@babel/transform-react-jsx",
      ]
    }),
    rollupJSON()
  ];
}

const appJs = new Rollup("client", {
  rollup: {
    input: "main.js",
    output: [
      {
        sourcemap: true,
        file: "app.js",
        format: "iife"
      }
    ],
    plugins: rollupPlugins()
  }
});

// function compileSass(source, destination) {
//   return new BroccoliSass(
//     [
//       "css",
//       "vendor/bootstrap-sass/assets/stylesheets/",
//       "vendor/bootstrap-toggle/",
//       "vendor/"
//     ],
//     source,
//     destination
//   );
// }

Concatenator.prototype = Object.create(CachingPlugin.prototype);
Concatenator.prototype.constructor = Concatenator;
function Concatenator(inputNode, inputFiles, outputFile, options) {
  options = options || {};
  this.inputFiles = inputFiles;
  this.outputFile = outputFile;
  this.options = options;
  CachingPlugin.call(this, [inputNode], {
    // inputFiles: inputFiles,
    annotation: options.annotation
  });
}

Concatenator.prototype.build = function() {
  let output = "";
  let filesIncluded = new Set();
  for (let pattern of this.inputFiles) {
    let files = glob.sync(pattern, {
      cwd: this.inputPaths[0],
      nomount: true,
      nodir: true
    });
    if (files.length === 0) throw new Error("Not found: " + pattern);
    for (let relativePath of files) {
      if (filesIncluded.has(relativePath)) continue;
      if (filesIncluded.size > 0) output += this.options.separator || "\n;\n";
      filesIncluded.add(relativePath);
      output += fs.readFileSync(
        this.inputPaths[0] + "/" + relativePath,
        "utf8"
      );
    }
  }
  mkdirp.sync(this.outputPath + "/" + path.dirname(this.outputFile));
  fs.writeFileSync(this.outputPath + "/" + this.outputFile, output);
};

// cssFiles = [
//   "application",
// ].map((base) => compileSass(`${base}.scss`, `${base}.css`));

let vendorJs = new Concatenator(
  new UnwatchedDir("node_modules"),
  [
    "jquery/dist/jquery.slim.min.js",
    "@popperjs/core/dist/umd/popper.min.js",
    "bootstrap/dist/js/bootstrap.min.js",
  ],
  "vendor.js"
);

let applicationJs = new Concatenator(
  new MergeTrees([appJs, vendorJs]),
  ["vendor.js", "app.js"],
  "application.js"
);

let ieShim = new Funnel("node_modules/core-js/client", {
  include: ["shim.min.js"]
});

let sentryJs = new Funnel("node_modules/@sentry/browser/build", {
  include: ["bundle.min.js"],
  getDestinationPath: function(relativePath) {
    return "sentry.js"
  }
})

const assets = new MergeTrees([/*...cssFiles, */ applicationJs, sentryJs, ieShim]);

let complete = assets

// let complete = new MergeTrees([
//   "public",
//   new Funnel(assets, { destDir: "assets" }),
//   pages
// ]);

if (process.env.NODE_ENV === "production") {
//   // Keep the unminified application.js around for source map support.
//   let originalApplicationJs = new Funnel(complete, {
//     files: ["/assets/application.js"]
//   });

  // complete = new BroccoliCleanCss(complete, {
  //   rebase: false
  // });

  complete = new BroccoliUglify(complete);

  // complete = new AssetRev(complete, {
  //   extensions: ["js", "css", "png", "svg", "jpg", "gif", "map"],
  //   exclude: [],

  //   // This performs a naive search-and-replace from /assets/application.js to
  //   // /assets/application-7295d7a9999e5901e276b5eeadf72239.js. If this breaks
  //   // things in HTML, we could make the substitution explicit using an assetPath
  //   // function in Pug templates, but this also makes building a bunch more
  //   // complex -- see 13773e1.
  //   replaceExtensions: ["html", "css", "js"]
  // });

//   complete = new MergeTrees([complete, originalApplicationJs]);
}

module.exports = complete;

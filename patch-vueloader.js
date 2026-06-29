const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, 'node_modules/@nativescript/webpack/dist/configuration/vue.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  
  if (content.includes("require.resolve('vue-loader/lib/index.js')") && !content.includes("vue-loader/dist/index.js")) {
    content = content.replace(
      "const vueLoaderPath = require.resolve('vue-loader/lib/index.js');",
      `let vueLoaderPath;
        try {
            vueLoaderPath = require.resolve('vue-loader/lib/index.js');
        } catch (e) {
            vueLoaderPath = require.resolve('vue-loader/dist/index.js');
        }`
    );
    content = content.replace(
      "const patchedSource = source.replace(/(isServer\\s=\\s)(target\\s===\\s'node')/g, '$1false;');",
      `let patchedSource = source;
        if (source.includes("target === 'node'")) {
            patchedSource = source.replace(/target === 'node'/g, 'false');
        } else if (source.includes("target === \\"node\\"")) {
            patchedSource = source.replace(/target === \\"node\\"/g, 'false');
        } else {
            patchedSource = source.replace(/(isServer\\s=\\s)(target\\s===\\s'node')/g, '$1false;');
        }`
    );
    
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Successfully patched @nativescript/webpack for Vue 3 VueLoader HMR!');
  } else {
    console.log('@nativescript/webpack is already patched or format is unrecognized.');
  }
} else {
  console.log('@nativescript/webpack not found.');
}

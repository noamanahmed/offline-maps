"use strict";
(() => {
var exports = {};
exports.id = "bundle";
exports.ids = ["bundle"];
exports.modules = {

/***/ "./src/app.ts"
(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/app.css");
/* harmony import */ var nativescript_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/nativescript-vue/dist/index.js");
/* harmony import */ var _components_Home_vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/components/Home.vue");
// Added by app-css-loader



(0,nativescript_vue__WEBPACK_IMPORTED_MODULE_1__.createApp)(_components_Home_vue__WEBPACK_IMPORTED_MODULE_2__["default"]).start();


if (true) {
    let hash = __webpack_require__.h();
    let hmrBootEmittedSymbol = Symbol.for('HMRBootEmitted');
    let originalLiveSyncSymbol = Symbol.for('OriginalLiveSync');
    let hmrRuntimeLastLiveSyncSymbol = Symbol.for('HMRRuntimeLastLiveSync');
    const logVerbose = (title, ...info) => {
        if (false) // removed by dead control flow
{}
    };
    const setStatus = (hash, status, message, ...info) => {
        // format is important - CLI expects this exact format
        console.log(`[HMR][${hash}] ${status} | ${message}`);
        if (info === null || info === void 0 ? void 0 : info.length) {
            logVerbose('Additional Info', info);
        }
        // return true if operation was successful
        return status === 'success';
    };
    const applyOptions = {
        ignoreUnaccepted: false,
        ignoreDeclined: false,
        ignoreErrored: false,
        onDeclined(info) {
            setStatus(hash, 'failure', 'A module has been declined.', info);
        },
        onUnaccepted(info) {
            setStatus(hash, 'failure', 'A module has not been accepted.', info);
        },
        onAccepted(info) {
            // console.log('accepted', info)
            logVerbose('Module Accepted', info);
        },
        onDisposed(info) {
            // console.log('disposed', info)
            logVerbose('Module Disposed', info);
        },
        onErrored(info) {
            setStatus(hash, 'failure', 'A module has errored.', info);
        },
    };
    // Important: Keep as function and not fat arrow; at the moment hermes does not support them
    const checkAndApply = async function () {
        hash = __webpack_require__.h();
        const modules = await module.hot.check().catch((error) => {
            return setStatus(hash, 'failure', 'Failed to check.', error.message || error.stack);
        });
        if (!modules) {
            logVerbose('No modules to apply.');
            return false;
        }
        const appliedModules = await module.hot
            .apply(applyOptions)
            .catch((error) => {
            return setStatus(hash, 'failure', 'Failed to apply.', error.message || error.stack);
        });
        if (!appliedModules) {
            logVerbose('No modules applied.');
            return false;
        }
        return setStatus(hash, 'success', 'Successfully applied update.');
    };
    const requireExists = (path) => {
        try {
            global['require'](path);
            return true;
        }
        catch (err) {
            return false;
        }
    };
    const hasUpdate = () => {
        // Prefer platform-agnostic JS hot-update manifests; fall back to JSON
        // if needed. On iOS, the .hot-update.js files are present under the
        // app folder (see platforms/ios <app>/bundle.*.hot-update.js), while on
        // Android the JSON manifests are used by HMR. Checking JS first keeps
        // behavior correct for iOS without regressing Android.
        const candidates = [
            `~/bundle.${__webpack_require__.h()}.hot-update.js`,
            `~/runtime.${__webpack_require__.h()}.hot-update.js`,
            `~/bundle.${__webpack_require__.h()}.hot-update.json`,
            `~/runtime.${__webpack_require__.h()}.hot-update.json`,
        ];
        return candidates.some((path) => requireExists(path));
    };
    if (global.__onLiveSync !== global[hmrRuntimeLastLiveSyncSymbol]) {
        // we store the original liveSync here in case this code runs again
        // which happens when you module.hot.accept() the main file
        global[originalLiveSyncSymbol] = global.__onLiveSync;
    }
    global[hmrRuntimeLastLiveSyncSymbol] = async function () {
        logVerbose('LiveSync');
        if (!hasUpdate()) {
            return false;
        }
        if (!(await checkAndApply())) {
            return false;
        }
        await global[originalLiveSyncSymbol]();
    };
    global.__onLiveSync = global[hmrRuntimeLastLiveSyncSymbol];
    if (!global[hmrBootEmittedSymbol]) {
        global[hmrBootEmittedSymbol] = true;
        setStatus(hash, 'boot', 'HMR Enabled - waiting for changes...');
    }
}


/***/ },

/***/ "./node_modules/@nativescript/webpack/dist/loaders/apply-css-loader/index.js!./node_modules/@nativescript/webpack/dist/loaders/css2json-loader/index.js!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-7.use[3]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/Home.vue?vue&type=style&index=0&id=8dc7cce2&lang=css"
(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* CSS2JSON */

const ___CSS2JSON_LOADER_EXPORT___ = {"type":"stylesheet","stylesheet":{"rules":[{"type":"comment","comment":" .info {\n    font-size: 20;\n  } "}],"parsingErrors":[]}}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS2JSON_LOADER_EXPORT___);
const { addTaggedAdditionalCSS } = __webpack_require__("./node_modules/@nativescript/core/ui/styling/style-scope.js");
addTaggedAdditionalCSS(___CSS2JSON_LOADER_EXPORT___, "/var/www/projects/offline-apps/src/components/Home.vue")
if(true) {
	module.hot.accept()
	module.hot.dispose(() => {
		const { removeTaggedAdditionalCSS } = __webpack_require__("./node_modules/@nativescript/core/ui/styling/style-scope.js");
		removeTaggedAdditionalCSS("/var/www/projects/offline-apps/src/components/Home.vue")
	})
}

/***/ },

/***/ "./src/app.css"
(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* CSS2JSON */

const ___CSS2JSON_LOADER_EXPORT___ = {"type":"stylesheet","stylesheet":{"rules":[{"type":"comment","comment":"! tailwindcss v4.3.1 | MIT License | https://tailwindcss.com "},{"type":"rule","selectors":[".ns-root",".ns-modal",".ns-root",".ns-modal"],"declarations":[{"type":"declaration","property":"--font-sans","value":"ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans, sans-serif, \"Apple Color Emoji\",\n      \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\""},{"type":"declaration","property":"--font-mono","value":"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\",\n      \"Courier New\", monospace"},{"type":"declaration","property":"--color-blue-400","value":"rgb(86, 162, 255)"},{"type":"declaration","property":"--color-gray-500","value":"rgb(106, 114, 130)"},{"type":"declaration","property":"--color-gray-900","value":"rgb(16, 24, 40)"},{"type":"declaration","property":"--color-white","value":"#fff"},{"type":"declaration","property":"--spacing","value":"4"},{"type":"declaration","property":"--text-lg","value":"18"},{"type":"declaration","property":"--text-lg--line-height","value":"calc(1.75 / 1.125)"},{"type":"declaration","property":"--text-xl","value":"20"},{"type":"declaration","property":"--text-xl--line-height","value":"calc(1.75 / 1.25)"},{"type":"declaration","property":"--text-2xl","value":"24"},{"type":"declaration","property":"--text-2xl--line-height","value":"calc(2 / 1.5)"},{"type":"declaration","property":"--text-3xl","value":"30"},{"type":"declaration","property":"--text-3xl--line-height","value":"calc(2.25 / 1.875)"},{"type":"declaration","property":"--font-weight-bold","value":"700"},{"type":"declaration","property":"--radius-lg","value":"8"},{"type":"declaration","property":"--radius-3xl","value":"24"},{"type":"declaration","property":"--default-font-family","value":"var(--font-sans)"},{"type":"declaration","property":"--default-mono-font-family","value":"var(--font-mono)"}]},{"type":"supports","supports":"(color: color(display-p3 0 0 0%))","rules":[{"type":"rule","selectors":[".ns-root",".ns-modal",".ns-root",".ns-modal"],"declarations":[{"type":"declaration","property":"--color-blue-400","value":"rgb(86, 162, 255)"}]},{"type":"media","media":"(color-gamut: p3)","rules":[{"type":"rule","selectors":[".ns-root",".ns-modal",".ns-root",".ns-modal"],"declarations":[{"type":"declaration","property":"--color-blue-400","value":"color(display-p3 0.39744 0.62813 0.99212)"}]}]}]},{"type":"rule","selectors":["*","::after","::before","::backdrop","::file-selector-button"],"declarations":[{"type":"declaration","property":"margin","value":"0"},{"type":"declaration","property":"padding","value":"0"}]},{"type":"rule","selectors":["html",".ns-root",".ns-modal"],"declarations":[{"type":"declaration","property":"line-height","value":"1.5"},{"type":"declaration","property":"font-family","value":"ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\""},{"type":"declaration","property":"font-family","value":"var(--default-font-family, ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\")"},{"type":"declaration","property":"font-variation-settings","value":"normal"},{"type":"declaration","property":"font-variation-settings","value":"var(--default-font-variation-settings, normal)"}]},{"type":"rule","selectors":["hr"],"declarations":[{"type":"declaration","property":"height","value":"0"},{"type":"declaration","property":"color","value":"inherit"},{"type":"declaration","property":"border-top-width","value":"1px"}]},{"type":"rule","selectors":["abbr[title]"],"declarations":[{"type":"declaration","property":"text-decoration","value":"underline"}]},{"type":"rule","selectors":["h1","h2","h3","h4","h5","h6"],"declarations":[{"type":"declaration","property":"font-size","value":"inherit"},{"type":"declaration","property":"font-weight","value":"inherit"}]},{"type":"rule","selectors":["a"],"declarations":[{"type":"declaration","property":"color","value":"inherit"}]},{"type":"rule","selectors":["b","strong"],"declarations":[{"type":"declaration","property":"font-weight","value":"bolder"}]},{"type":"rule","selectors":["code","kbd","samp","pre"],"declarations":[{"type":"declaration","property":"font-family","value":"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace"},{"type":"declaration","property":"font-family","value":"var(--default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace)"},{"type":"declaration","property":"font-variation-settings","value":"normal"},{"type":"declaration","property":"font-variation-settings","value":"var(--default-mono-font-variation-settings, normal)"},{"type":"declaration","property":"font-size","value":"16"}]},{"type":"rule","selectors":["small"],"declarations":[{"type":"declaration","property":"font-size","value":"80%"}]},{"type":"rule","selectors":["sub","sup"],"declarations":[{"type":"declaration","property":"font-size","value":"75%"},{"type":"declaration","property":"line-height","value":"0"}]},{"type":"rule","selectors":["table"],"declarations":[{"type":"declaration","property":"border-color","value":"inherit"}]},{"type":"rule","selectors":["img","svg","video","canvas","audio","iframe","embed","object"],"declarations":[{"type":"declaration","property":"vertical-align","value":"center"}]},{"type":"rule","selectors":["img","video"],"declarations":[{"type":"declaration","property":"height","value":"auto"}]},{"type":"rule","selectors":["button","input","select","optgroup","textarea","::file-selector-button"],"declarations":[{"type":"declaration","property":"font","value":"inherit"},{"type":"declaration","property":"font-variation-settings","value":"inherit"},{"type":"declaration","property":"letter-spacing","value":"inherit"},{"type":"declaration","property":"color","value":"inherit"},{"type":"declaration","property":"border-radius","value":"0"},{"type":"declaration","property":"background-color","value":"transparent"},{"type":"declaration","property":"opacity","value":"1"}]},{"type":"rule","selectors":["select[multiple] optgroup"],"declarations":[{"type":"declaration","property":"font-weight","value":"bolder"}]},{"type":"rule","selectors":["select[size] optgroup"],"declarations":[{"type":"declaration","property":"font-weight","value":"bolder"}]},{"type":"rule","selectors":["::file-selector-button"],"declarations":[{"type":"declaration","property":"margin-right","value":"4px"}]},{"type":"rule","selectors":["::-webkit-date-and-time-value"],"declarations":[{"type":"declaration","property":"min-height","value":"1lh"}]},{"type":"rule","selectors":["::-webkit-datetime-edit-fields-wrapper"],"declarations":[{"type":"declaration","property":"padding","value":"0"}]},{"type":"rule","selectors":["::-webkit-datetime-edit","::-webkit-datetime-edit-year-field","::-webkit-datetime-edit-month-field","::-webkit-datetime-edit-day-field","::-webkit-datetime-edit-hour-field","::-webkit-datetime-edit-minute-field","::-webkit-datetime-edit-second-field","::-webkit-datetime-edit-millisecond-field","::-webkit-datetime-edit-meridiem-field"],"declarations":[{"type":"declaration","property":"padding-top","value":"0"},{"type":"declaration","property":"padding-bottom","value":"0"}]},{"type":"rule","selectors":["::-webkit-calendar-picker-indicator"],"declarations":[{"type":"declaration","property":"line-height","value":"1"}]},{"type":"rule","selectors":[":-moz-ui-invalid"],"declarations":[{"type":"declaration","property":"box-shadow","value":"none"}]},{"type":"rule","selectors":["::-webkit-inner-spin-button","::-webkit-outer-spin-button"],"declarations":[{"type":"declaration","property":"height","value":"auto"}]},{"type":"rule","selectors":[".container"],"declarations":[{"type":"declaration","property":"width","value":"100%"}]},{"type":"rule","selectors":[".container\\!"],"declarations":[{"type":"declaration","property":"width","value":"100% !important"}]},{"type":"rule","selectors":[".mt-4"],"declarations":[{"type":"declaration","property":"margin-top","value":"calc(var(--spacing) * 4)"}]},{"type":"rule","selectors":[".h-5"],"declarations":[{"type":"declaration","property":"height","value":"calc(var(--spacing) * 5)"}]},{"type":"rule","selectors":[".w-5"],"declarations":[{"type":"declaration","property":"width","value":"calc(var(--spacing) * 5)"}]},{"type":"rule","selectors":[".transform"],"declarations":[{"type":"declaration","property":"transform","value":""},{"type":"declaration","property":"transform","value":"var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,)"}]},{"type":"rule","selectors":[".rounded-full"],"declarations":[{"type":"declaration","property":"border-radius","value":"calc(infinity * 1px)"}]},{"type":"rule","selectors":[".rounded-lg"],"declarations":[{"type":"declaration","property":"border-radius","value":"var(--radius-lg)"}]},{"type":"rule","selectors":[".rounded-t-3xl"],"declarations":[{"type":"declaration","property":"border-top-left-radius","value":"var(--radius-3xl)"},{"type":"declaration","property":"border-top-right-radius","value":"var(--radius-3xl)"}]},{"type":"rule","selectors":[".border-2"],"declarations":[{"type":"declaration","property":"border-width","value":"2px"}]},{"type":"rule","selectors":[".border-blue-400"],"declarations":[{"type":"declaration","property":"border-color","value":"var(--color-blue-400)"}]},{"type":"rule","selectors":[".bg-\\[\\#65adf1\\]"],"declarations":[{"type":"declaration","property":"background-color","value":"#65adf1"}]},{"type":"rule","selectors":[".bg-transparent"],"declarations":[{"type":"declaration","property":"background-color","value":"transparent"}]},{"type":"rule","selectors":[".bg-white"],"declarations":[{"type":"declaration","property":"background-color","value":"var(--color-white)"}]},{"type":"rule","selectors":[".px-4"],"declarations":[{"type":"declaration","property":"padding-left","value":"calc(var(--spacing) * 4)"},{"type":"declaration","property":"padding-right","value":"calc(var(--spacing) * 4)"}]},{"type":"rule","selectors":[".py-2"],"declarations":[{"type":"declaration","property":"padding-top","value":"calc(var(--spacing) * 2)"},{"type":"declaration","property":"padding-bottom","value":"calc(var(--spacing) * 2)"}]},{"type":"rule","selectors":[".py-3"],"declarations":[{"type":"declaration","property":"padding-top","value":"calc(var(--spacing) * 3)"},{"type":"declaration","property":"padding-bottom","value":"calc(var(--spacing) * 3)"}]},{"type":"rule","selectors":[".py-10"],"declarations":[{"type":"declaration","property":"padding-top","value":"calc(var(--spacing) * 10)"},{"type":"declaration","property":"padding-bottom","value":"calc(var(--spacing) * 10)"}]},{"type":"rule","selectors":[".text-center"],"declarations":[{"type":"declaration","property":"text-align","value":"center"}]},{"type":"rule","selectors":[".align-middle"],"declarations":[{"type":"declaration","property":"vertical-align","value":"center"}]},{"type":"rule","selectors":[".text-2xl"],"declarations":[{"type":"declaration","property":"font-size","value":"var(--text-2xl)"},{"type":"declaration","property":"line-height","value":"var(--tw-leading, var(--text-2xl--line-height))"}]},{"type":"rule","selectors":[".text-3xl"],"declarations":[{"type":"declaration","property":"font-size","value":"var(--text-3xl)"},{"type":"declaration","property":"line-height","value":"var(--tw-leading, var(--text-3xl--line-height))"}]},{"type":"rule","selectors":[".text-lg"],"declarations":[{"type":"declaration","property":"font-size","value":"var(--text-lg)"},{"type":"declaration","property":"line-height","value":"var(--tw-leading, var(--text-lg--line-height))"}]},{"type":"rule","selectors":[".text-xl"],"declarations":[{"type":"declaration","property":"font-size","value":"var(--text-xl)"},{"type":"declaration","property":"line-height","value":"var(--tw-leading, var(--text-xl--line-height))"}]},{"type":"rule","selectors":[".font-bold"],"declarations":[{"type":"declaration","property":"--tw-font-weight","value":"var(--font-weight-bold)"},{"type":"declaration","property":"font-weight","value":"var(--font-weight-bold)"}]},{"type":"rule","selectors":[".text-gray-500"],"declarations":[{"type":"declaration","property":"color","value":"var(--color-gray-500)"}]},{"type":"rule","selectors":[".text-gray-900"],"declarations":[{"type":"declaration","property":"color","value":"var(--color-gray-900)"}]},{"type":"rule","selectors":[".text-white"],"declarations":[{"type":"declaration","property":"color","value":"var(--color-white)"}]},{"type":"rule","selectors":[".lowercase"],"declarations":[{"type":"declaration","property":"text-transform","value":"lowercase"}]},{"type":"rule","selectors":["ActionBar"],"declarations":[{"type":"declaration","property":"background-color","value":"#65adf1"},{"type":"declaration","property":"color","value":"white"}]},{"type":"rule","selectors":["Page"],"declarations":[{"type":"declaration","property":"background","value":"white"},{"type":"declaration","property":"color","value":"black"}]},{"type":"rule","selectors":["*","::before","::after","::backdrop"],"declarations":[{"type":"declaration","property":"--tw-rotate-x","value":"initial"},{"type":"declaration","property":"--tw-rotate-y","value":"initial"},{"type":"declaration","property":"--tw-rotate-z","value":"initial"},{"type":"declaration","property":"--tw-skew-x","value":"initial"},{"type":"declaration","property":"--tw-skew-y","value":"initial"},{"type":"declaration","property":"--tw-border-style","value":"solid"},{"type":"declaration","property":"--tw-font-weight","value":"initial"}]}],"parsingErrors":[]}}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS2JSON_LOADER_EXPORT___);
const { addTaggedAdditionalCSS } = __webpack_require__("./node_modules/@nativescript/core/ui/styling/style-scope.js");
addTaggedAdditionalCSS(___CSS2JSON_LOADER_EXPORT___, "/var/www/projects/offline-apps/src/app.css")
if(true) {
	module.hot.accept()
	module.hot.dispose(() => {
		const { removeTaggedAdditionalCSS } = __webpack_require__("./node_modules/@nativescript/core/ui/styling/style-scope.js");
		removeTaggedAdditionalCSS("/var/www/projects/offline-apps/src/app.css")
	})
}

/***/ },

/***/ "./node_modules/@nativescript/webpack/dist/loaders/nativescript-worker-loader/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-4.use[0]!./node_modules/@nativescript/webpack/dist/loaders/native-class-downlevel-loader/index.js!./node_modules/@nativescript/webpack/dist/loaders/native-class-strip-loader/index.js!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/Details.vue?vue&type=script&lang=ts&setup=true"
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/nativescript-vue/dist/index.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/*@__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.defineComponent)({
    __name: 'Details',
    setup(__props, { expose: __expose }) {
        __expose();
        const items = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)(Array(1000)
            .fill(0)
            .map((_, index) => `Item ${index + 1}`));
        const __returned__ = { items, get $navigateBack() { return vue__WEBPACK_IMPORTED_MODULE_0__.$navigateBack; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
}));


/***/ },

/***/ "./node_modules/@nativescript/webpack/dist/loaders/nativescript-worker-loader/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-4.use[0]!./node_modules/@nativescript/webpack/dist/loaders/native-class-downlevel-loader/index.js!./node_modules/@nativescript/webpack/dist/loaders/native-class-strip-loader/index.js!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/Home.vue?vue&type=script&lang=ts&setup=true"
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/nativescript-vue/dist/index.js");
/* harmony import */ var _Details_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/components/Details.vue");



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/*@__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.defineComponent)({
    __name: 'Home',
    setup(__props, { expose: __expose }) {
        __expose();
        const counter = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)(0);
        const message = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
            return `Blank {N}-Vue app: ${counter.value}`;
        });
        function logMessage() {
            console.log('You have tapped the message!');
        }
        let interval;
        (0,vue__WEBPACK_IMPORTED_MODULE_0__.onMounted)(() => {
            console.log('mounted');
            interval = setInterval(() => counter.value++, 100);
        });
        (0,vue__WEBPACK_IMPORTED_MODULE_0__.onUnmounted)(() => {
            console.log('unmounted');
            clearInterval(interval);
        });
        const __returned__ = { counter, message, logMessage, get interval() { return interval; }, set interval(v) { interval = v; }, get $navigateTo() { return vue__WEBPACK_IMPORTED_MODULE_0__.$navigateTo; }, Details: _Details_vue__WEBPACK_IMPORTED_MODULE_1__["default"] };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
}));


/***/ },

/***/ "./node_modules/@nativescript/webpack/dist/loaders/nativescript-worker-loader/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-4.use[0]!./node_modules/@nativescript/webpack/dist/loaders/native-class-downlevel-loader/index.js!./node_modules/@nativescript/webpack/dist/loaders/native-class-strip-loader/index.js!./node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[4]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/Details.vue?vue&type=template&id=1cb73342&ts=true"
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   render: () => (/* binding */ render)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/nativescript-vue/dist/index.js");

function render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_Label = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("Label");
    const _component_ContentView = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("ContentView");
    const _component_GridLayout = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("GridLayout");
    const _component_ListView = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("ListView");
    const _component_Page = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("Page");
    return ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createBlock)(_component_Page, { actionBarHidden: "true" }, {
        default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [
            (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_GridLayout, { rows: "auto, *" }, {
                default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [
                    (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_Label, {
                        text: "Go Back",
                        onTap: $setup.$navigateBack,
                        class: "text-center px-4 py-10 text-2xl text-gray-900 font-bold"
                    }, null, 8 /* PROPS */, ["onTap"]),
                    (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_ContentView, {
                        row: "1",
                        class: "bg-[#65adf1] rounded-t-3xl"
                    }, {
                        default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [
                            (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_ListView, {
                                items: $setup.items,
                                separatorColor: "transparent",
                                class: "bg-transparent"
                            }, {
                                default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(({ item }) => [
                                    (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_GridLayout, {
                                        columns: "*, auto",
                                        class: "px-4"
                                    }, {
                                        default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [
                                            (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_Label, {
                                                text: item,
                                                class: "text-3xl py-3 text-white"
                                            }, null, 8 /* PROPS */, ["text"]),
                                            (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_ContentView, {
                                                col: "1",
                                                class: "w-5 h-5 rounded-full bg-white"
                                            })
                                        ]),
                                        _: 2 /* DYNAMIC */
                                    }, 1024 /* DYNAMIC_SLOTS */)
                                ]),
                                _: 1 /* STABLE */
                            }, 8 /* PROPS */, ["items"])
                        ]),
                        _: 1 /* STABLE */
                    })
                ]),
                _: 1 /* STABLE */
            })
        ]),
        _: 1 /* STABLE */
    }));
}


/***/ },

/***/ "./node_modules/@nativescript/webpack/dist/loaders/nativescript-worker-loader/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-4.use[0]!./node_modules/@nativescript/webpack/dist/loaders/native-class-downlevel-loader/index.js!./node_modules/@nativescript/webpack/dist/loaders/native-class-strip-loader/index.js!./node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[4]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/Home.vue?vue&type=template&id=8dc7cce2&ts=true"
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   render: () => (/* binding */ render)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/nativescript-vue/dist/index.js");

function render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_Label = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("Label");
    const _component_ActionBar = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("ActionBar");
    const _component_Button = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("Button");
    const _component_GridLayout = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("GridLayout");
    const _component_Page = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("Page");
    const _component_Frame = (0,vue__WEBPACK_IMPORTED_MODULE_0__.resolveComponent)("Frame");
    return ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createBlock)(_component_Frame, null, {
        default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [
            (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_Page, null, {
                default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [
                    (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_ActionBar, null, {
                        default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [
                            (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_Label, {
                                text: "Home",
                                class: "font-bold text-lg"
                            })
                        ]),
                        _: 1 /* STABLE */
                    }),
                    (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_GridLayout, {
                        rows: "*, auto, auto, *",
                        class: "px-4"
                    }, {
                        default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [
                            (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_Label, {
                                row: "1",
                                class: "text-xl align-middle text-center text-gray-500",
                                text: $setup.message,
                                onTap: $setup.logMessage
                            }, null, 8 /* PROPS */, ["text"]),
                            (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)(_component_Button, {
                                row: "2",
                                onTap: _cache[0] || (_cache[0] = ($event) => ($setup.$navigateTo($setup.Details))),
                                class: "mt-4 px-4 py-2 bg-white border-2 border-blue-400 rounded-lg",
                                horizontalAlignment: "center"
                            }, {
                                default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [...(_cache[1] || (_cache[1] = [
                                        (0,vue__WEBPACK_IMPORTED_MODULE_0__.createTextVNode)(" View Details ", -1 /* CACHED */)
                                    ]))]),
                                _: 1 /* STABLE */
                            })
                        ]),
                        _: 1 /* STABLE */
                    })
                ]),
                _: 1 /* STABLE */
            })
        ]),
        _: 1 /* STABLE */
    }));
}


/***/ },

/***/ "./src/components/Details.vue"
(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Details_vue_vue_type_template_id_1cb73342_ts_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/components/Details.vue?vue&type=template&id=1cb73342&ts=true");
/* harmony import */ var _Details_vue_vue_type_script_lang_ts_setup_true__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/components/Details.vue?vue&type=script&lang=ts&setup=true");
/* harmony import */ var _node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/vue-loader/dist/exportHelper.js");




;
const __exports__ = /*#__PURE__*/(0,_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_Details_vue_vue_type_script_lang_ts_setup_true__WEBPACK_IMPORTED_MODULE_1__["default"], [['render',_Details_vue_vue_type_template_id_1cb73342_ts_true__WEBPACK_IMPORTED_MODULE_0__.render],['__file',"src/components/Details.vue"]])
/* hot reload */
if (true) {
  __exports__.__hmrId = "1cb73342"
  const api = __VUE_HMR_RUNTIME__
  module.hot.accept()
  if (!api.createRecord('1cb73342', __exports__)) {
    api.reload('1cb73342', __exports__)
  }
  
  module.hot.accept("./src/components/Details.vue?vue&type=template&id=1cb73342&ts=true", __WEBPACK_OUTDATED_DEPENDENCIES__ => { /* harmony import */ _Details_vue_vue_type_template_id_1cb73342_ts_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/components/Details.vue?vue&type=template&id=1cb73342&ts=true");
 return (() => {
    api.rerender('1cb73342', _Details_vue_vue_type_template_id_1cb73342_ts_true__WEBPACK_IMPORTED_MODULE_0__.render)
  })(__WEBPACK_OUTDATED_DEPENDENCIES__); })

}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__exports__);

/***/ },

/***/ "./src/components/Home.vue"
(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Home_vue_vue_type_template_id_8dc7cce2_ts_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/components/Home.vue?vue&type=template&id=8dc7cce2&ts=true");
/* harmony import */ var _Home_vue_vue_type_script_lang_ts_setup_true__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/components/Home.vue?vue&type=script&lang=ts&setup=true");
/* harmony import */ var _Home_vue_vue_type_style_index_0_id_8dc7cce2_lang_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/components/Home.vue?vue&type=style&index=0&id=8dc7cce2&lang=css");
/* harmony import */ var _node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/vue-loader/dist/exportHelper.js");




;


const __exports__ = /*#__PURE__*/(0,_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_Home_vue_vue_type_script_lang_ts_setup_true__WEBPACK_IMPORTED_MODULE_1__["default"], [['render',_Home_vue_vue_type_template_id_8dc7cce2_ts_true__WEBPACK_IMPORTED_MODULE_0__.render],['__file',"src/components/Home.vue"]])
/* hot reload */
if (true) {
  __exports__.__hmrId = "8dc7cce2"
  const api = __VUE_HMR_RUNTIME__
  module.hot.accept()
  if (!api.createRecord('8dc7cce2', __exports__)) {
    api.reload('8dc7cce2', __exports__)
  }
  
  module.hot.accept("./src/components/Home.vue?vue&type=template&id=8dc7cce2&ts=true", __WEBPACK_OUTDATED_DEPENDENCIES__ => { /* harmony import */ _Home_vue_vue_type_template_id_8dc7cce2_ts_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/components/Home.vue?vue&type=template&id=8dc7cce2&ts=true");
 return (() => {
    api.rerender('8dc7cce2', _Home_vue_vue_type_template_id_8dc7cce2_ts_true__WEBPACK_IMPORTED_MODULE_0__.render)
  })(__WEBPACK_OUTDATED_DEPENDENCIES__); })

}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__exports__);

/***/ },

/***/ "./src/components/Home.vue?vue&type=style&index=0&id=8dc7cce2&lang=css"
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* reexport safe */ _node_modules_nativescript_webpack_dist_loaders_apply_css_loader_index_js_node_modules_nativescript_webpack_dist_loaders_css2json_loader_index_js_node_modules_vue_loader_dist_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_7_use_3_node_modules_vue_loader_dist_index_js_ruleSet_0_use_0_Home_vue_vue_type_style_index_0_id_8dc7cce2_lang_css__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _node_modules_nativescript_webpack_dist_loaders_apply_css_loader_index_js_node_modules_nativescript_webpack_dist_loaders_css2json_loader_index_js_node_modules_vue_loader_dist_stylePostLoader_js_node_modules_postcss_loader_dist_cjs_js_clonedRuleSet_7_use_3_node_modules_vue_loader_dist_index_js_ruleSet_0_use_0_Home_vue_vue_type_style_index_0_id_8dc7cce2_lang_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/@nativescript/webpack/dist/loaders/apply-css-loader/index.js!./node_modules/@nativescript/webpack/dist/loaders/css2json-loader/index.js!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-7.use[3]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/Home.vue?vue&type=style&index=0&id=8dc7cce2&lang=css");
 

/***/ },

/***/ "./src/components/Details.vue?vue&type=script&lang=ts&setup=true"
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* reexport safe */ _node_modules_nativescript_webpack_dist_loaders_nativescript_worker_loader_index_js_node_modules_ts_loader_index_js_clonedRuleSet_4_use_0_node_modules_nativescript_webpack_dist_loaders_native_class_downlevel_loader_index_js_node_modules_nativescript_webpack_dist_loaders_native_class_strip_loader_index_js_node_modules_vue_loader_dist_index_js_ruleSet_0_use_0_Details_vue_vue_type_script_lang_ts_setup_true__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _node_modules_nativescript_webpack_dist_loaders_nativescript_worker_loader_index_js_node_modules_ts_loader_index_js_clonedRuleSet_4_use_0_node_modules_nativescript_webpack_dist_loaders_native_class_downlevel_loader_index_js_node_modules_nativescript_webpack_dist_loaders_native_class_strip_loader_index_js_node_modules_vue_loader_dist_index_js_ruleSet_0_use_0_Details_vue_vue_type_script_lang_ts_setup_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/@nativescript/webpack/dist/loaders/nativescript-worker-loader/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-4.use[0]!./node_modules/@nativescript/webpack/dist/loaders/native-class-downlevel-loader/index.js!./node_modules/@nativescript/webpack/dist/loaders/native-class-strip-loader/index.js!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/Details.vue?vue&type=script&lang=ts&setup=true");
 

/***/ },

/***/ "./src/components/Home.vue?vue&type=script&lang=ts&setup=true"
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* reexport safe */ _node_modules_nativescript_webpack_dist_loaders_nativescript_worker_loader_index_js_node_modules_ts_loader_index_js_clonedRuleSet_4_use_0_node_modules_nativescript_webpack_dist_loaders_native_class_downlevel_loader_index_js_node_modules_nativescript_webpack_dist_loaders_native_class_strip_loader_index_js_node_modules_vue_loader_dist_index_js_ruleSet_0_use_0_Home_vue_vue_type_script_lang_ts_setup_true__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _node_modules_nativescript_webpack_dist_loaders_nativescript_worker_loader_index_js_node_modules_ts_loader_index_js_clonedRuleSet_4_use_0_node_modules_nativescript_webpack_dist_loaders_native_class_downlevel_loader_index_js_node_modules_nativescript_webpack_dist_loaders_native_class_strip_loader_index_js_node_modules_vue_loader_dist_index_js_ruleSet_0_use_0_Home_vue_vue_type_script_lang_ts_setup_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/@nativescript/webpack/dist/loaders/nativescript-worker-loader/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-4.use[0]!./node_modules/@nativescript/webpack/dist/loaders/native-class-downlevel-loader/index.js!./node_modules/@nativescript/webpack/dist/loaders/native-class-strip-loader/index.js!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/Home.vue?vue&type=script&lang=ts&setup=true");
 

/***/ },

/***/ "./src/components/Details.vue?vue&type=template&id=1cb73342&ts=true"
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   render: () => (/* reexport safe */ _node_modules_nativescript_webpack_dist_loaders_nativescript_worker_loader_index_js_node_modules_ts_loader_index_js_clonedRuleSet_4_use_0_node_modules_nativescript_webpack_dist_loaders_native_class_downlevel_loader_index_js_node_modules_nativescript_webpack_dist_loaders_native_class_strip_loader_index_js_node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_4_node_modules_vue_loader_dist_index_js_ruleSet_0_use_0_Details_vue_vue_type_template_id_1cb73342_ts_true__WEBPACK_IMPORTED_MODULE_0__.render)
/* harmony export */ });
/* harmony import */ var _node_modules_nativescript_webpack_dist_loaders_nativescript_worker_loader_index_js_node_modules_ts_loader_index_js_clonedRuleSet_4_use_0_node_modules_nativescript_webpack_dist_loaders_native_class_downlevel_loader_index_js_node_modules_nativescript_webpack_dist_loaders_native_class_strip_loader_index_js_node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_4_node_modules_vue_loader_dist_index_js_ruleSet_0_use_0_Details_vue_vue_type_template_id_1cb73342_ts_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/@nativescript/webpack/dist/loaders/nativescript-worker-loader/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-4.use[0]!./node_modules/@nativescript/webpack/dist/loaders/native-class-downlevel-loader/index.js!./node_modules/@nativescript/webpack/dist/loaders/native-class-strip-loader/index.js!./node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[4]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/Details.vue?vue&type=template&id=1cb73342&ts=true");


/***/ },

/***/ "./src/components/Home.vue?vue&type=template&id=8dc7cce2&ts=true"
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   render: () => (/* reexport safe */ _node_modules_nativescript_webpack_dist_loaders_nativescript_worker_loader_index_js_node_modules_ts_loader_index_js_clonedRuleSet_4_use_0_node_modules_nativescript_webpack_dist_loaders_native_class_downlevel_loader_index_js_node_modules_nativescript_webpack_dist_loaders_native_class_strip_loader_index_js_node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_4_node_modules_vue_loader_dist_index_js_ruleSet_0_use_0_Home_vue_vue_type_template_id_8dc7cce2_ts_true__WEBPACK_IMPORTED_MODULE_0__.render)
/* harmony export */ });
/* harmony import */ var _node_modules_nativescript_webpack_dist_loaders_nativescript_worker_loader_index_js_node_modules_ts_loader_index_js_clonedRuleSet_4_use_0_node_modules_nativescript_webpack_dist_loaders_native_class_downlevel_loader_index_js_node_modules_nativescript_webpack_dist_loaders_native_class_strip_loader_index_js_node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_4_node_modules_vue_loader_dist_index_js_ruleSet_0_use_0_Home_vue_vue_type_template_id_8dc7cce2_ts_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/@nativescript/webpack/dist/loaders/nativescript-worker-loader/index.js!./node_modules/ts-loader/index.js??clonedRuleSet-4.use[0]!./node_modules/@nativescript/webpack/dist/loaders/native-class-downlevel-loader/index.js!./node_modules/@nativescript/webpack/dist/loaders/native-class-strip-loader/index.js!./node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[4]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/components/Home.vue?vue&type=template&id=8dc7cce2&ts=true");


/***/ },

/***/ "~/package.json"
(module) {

module.exports = require("~/package.json");

/***/ }

};
;

// load runtime
var __webpack_require__ = require("./runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor"], () => (__webpack_exec__("./node_modules/@nativescript/core/globals/index.js"), __webpack_exec__("./node_modules/@nativescript/core/bundle-entry-points.js"), __webpack_exec__("./src/app.ts"), __webpack_exec__("./node_modules/@nativescript/core/ui/frame/index.android.js"), __webpack_exec__("./node_modules/@nativescript/core/ui/frame/activity.android.js")));
const __webpack_export_target__ = exports;
for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNO0FBQ1Q7QUFFTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0h4Qjs7QUFFQSxzQ0FBc0Msa0NBQWtDLFVBQVUsb0NBQW9DLG9CQUFvQixNQUFNLEVBQUU7QUFDbEosaUVBQWUsNEJBQTRCO0FBQzNDLFFBQVEseUJBQXlCLEVBQUUsbUJBQU8sQ0FBQyw2REFBMkM7QUFDdEY7QUFDQSxHQUFHLElBQVU7QUFDYixDQUFDLGlCQUFpQjtBQUNsQixDQUFDLFVBQVU7QUFDWCxVQUFVLDRCQUE0QixFQUFFLG1CQUFPLENBQUMsNkRBQTJDO0FBQzNGO0FBQ0EsRUFBRTtBQUNGLEM7Ozs7Ozs7Ozs7O0FDWkE7O0FBRUEsc0NBQXNDLGtDQUFrQyxVQUFVLDJGQUEyRixFQUFFLDJGQUEyRixrUEFBa1AsRUFBRSxzS0FBc0ssRUFBRSwrRUFBK0UsRUFBRSxnRkFBZ0YsRUFBRSw2RUFBNkUsRUFBRSwrREFBK0QsRUFBRSx3REFBd0QsRUFBRSx5REFBeUQsRUFBRSxzRkFBc0YsRUFBRSx5REFBeUQsRUFBRSxxRkFBcUYsRUFBRSwwREFBMEQsRUFBRSxrRkFBa0YsRUFBRSwwREFBMEQsRUFBRSx1RkFBdUYsRUFBRSxtRUFBbUUsRUFBRSwwREFBMEQsRUFBRSw0REFBNEQsRUFBRSxtRkFBbUYsRUFBRSx3RkFBd0YsRUFBRSxFQUFFLDJFQUEyRSwyRkFBMkYsK0VBQStFLEVBQUUsRUFBRSxxREFBcUQsMkZBQTJGLHVHQUF1RyxFQUFFLEVBQUUsRUFBRSxFQUFFLDRHQUE0RyxxREFBcUQsRUFBRSxzREFBc0QsRUFBRSxFQUFFLDJFQUEyRSw0REFBNEQsRUFBRSwyT0FBMk8sRUFBRSwrTUFBK00sRUFBRSwyRUFBMkUsRUFBRSxtSEFBbUgsRUFBRSxFQUFFLGtEQUFrRCxxREFBcUQsRUFBRSwwREFBMEQsRUFBRSxpRUFBaUUsRUFBRSxFQUFFLDJEQUEyRCxzRUFBc0UsRUFBRSxFQUFFLDJFQUEyRSw4REFBOEQsRUFBRSxnRUFBZ0UsRUFBRSxFQUFFLGlEQUFpRCwwREFBMEQsRUFBRSxFQUFFLDBEQUEwRCwrREFBK0QsRUFBRSxFQUFFLHVFQUF1RSwrSkFBK0osRUFBRSxnTUFBZ00sRUFBRSwyRUFBMkUsRUFBRSx3SEFBd0gsRUFBRSx5REFBeUQsRUFBRSxFQUFFLHFEQUFxRCwwREFBMEQsRUFBRSxFQUFFLHlEQUF5RCwwREFBMEQsRUFBRSwwREFBMEQsRUFBRSxFQUFFLHFEQUFxRCxpRUFBaUUsRUFBRSxFQUFFLDRHQUE0RyxrRUFBa0UsRUFBRSxFQUFFLDJEQUEyRCx3REFBd0QsRUFBRSxFQUFFLHNIQUFzSCx5REFBeUQsRUFBRSw0RUFBNEUsRUFBRSxtRUFBbUUsRUFBRSwwREFBMEQsRUFBRSw0REFBNEQsRUFBRSx5RUFBeUUsRUFBRSxzREFBc0QsRUFBRSxFQUFFLHlFQUF5RSwrREFBK0QsRUFBRSxFQUFFLHFFQUFxRSwrREFBK0QsRUFBRSxFQUFFLHNFQUFzRSw2REFBNkQsRUFBRSxFQUFFLDZFQUE2RSwyREFBMkQsRUFBRSxFQUFFLHNGQUFzRixzREFBc0QsRUFBRSxFQUFFLDhYQUE4WCwwREFBMEQsRUFBRSw2REFBNkQsRUFBRSxFQUFFLG1GQUFtRiwwREFBMEQsRUFBRSxFQUFFLGdFQUFnRSw0REFBNEQsRUFBRSxFQUFFLHlHQUF5Ryx3REFBd0QsRUFBRSxFQUFFLDBEQUEwRCx1REFBdUQsRUFBRSxFQUFFLDZEQUE2RCxrRUFBa0UsRUFBRSxFQUFFLHFEQUFxRCxnRkFBZ0YsRUFBRSxFQUFFLG9EQUFvRCw0RUFBNEUsRUFBRSxFQUFFLG9EQUFvRCwyRUFBMkUsRUFBRSxFQUFFLDBEQUEwRCx1REFBdUQsRUFBRSxzSkFBc0osRUFBRSxFQUFFLDZEQUE2RCwrRUFBK0UsRUFBRSxFQUFFLDJEQUEyRCwyRUFBMkUsRUFBRSxFQUFFLDhEQUE4RCxxRkFBcUYsRUFBRSxzRkFBc0YsRUFBRSxFQUFFLHlEQUF5RCw2REFBNkQsRUFBRSxFQUFFLGdFQUFnRSwrRUFBK0UsRUFBRSxFQUFFLG1FQUFtRSxxRUFBcUUsRUFBRSxFQUFFLCtEQUErRCx5RUFBeUUsRUFBRSxFQUFFLHlEQUF5RCxnRkFBZ0YsRUFBRSxFQUFFLHFEQUFxRCxrRkFBa0YsRUFBRSxtRkFBbUYsRUFBRSxFQUFFLHFEQUFxRCxpRkFBaUYsRUFBRSxvRkFBb0YsRUFBRSxFQUFFLHFEQUFxRCxpRkFBaUYsRUFBRSxvRkFBb0YsRUFBRSxFQUFFLHNEQUFzRCxrRkFBa0YsRUFBRSxxRkFBcUYsRUFBRSxFQUFFLDREQUE0RCw4REFBOEQsRUFBRSxFQUFFLDZEQUE2RCxrRUFBa0UsRUFBRSxFQUFFLHlEQUF5RCxzRUFBc0UsRUFBRSx3R0FBd0csRUFBRSxFQUFFLHlEQUF5RCxzRUFBc0UsRUFBRSx3R0FBd0csRUFBRSxFQUFFLHdEQUF3RCxxRUFBcUUsRUFBRSx1R0FBdUcsRUFBRSxFQUFFLHdEQUF3RCxxRUFBcUUsRUFBRSx1R0FBdUcsRUFBRSxFQUFFLDBEQUEwRCxxRkFBcUYsRUFBRSxnRkFBZ0YsRUFBRSxFQUFFLDhEQUE4RCx3RUFBd0UsRUFBRSxFQUFFLDhEQUE4RCx3RUFBd0UsRUFBRSxFQUFFLDJEQUEyRCxxRUFBcUUsRUFBRSxFQUFFLDBEQUEwRCxxRUFBcUUsRUFBRSxFQUFFLHlEQUF5RCxxRUFBcUUsRUFBRSx3REFBd0QsRUFBRSxFQUFFLG9EQUFvRCw2REFBNkQsRUFBRSx3REFBd0QsRUFBRSxFQUFFLG1GQUFtRixrRUFBa0UsRUFBRSxrRUFBa0UsRUFBRSxrRUFBa0UsRUFBRSxnRUFBZ0UsRUFBRSxnRUFBZ0UsRUFBRSxvRUFBb0UsRUFBRSxxRUFBcUUsRUFBRTtBQUN0aGIsaUVBQWUsNEJBQTRCO0FBQzNDLFFBQVEseUJBQXlCLEVBQUUsbUJBQU8sQ0FBQyw2REFBMkM7QUFDdEY7QUFDQSxHQUFHLElBQVU7QUFDYixDQUFDLGlCQUFpQjtBQUNsQixDQUFDLFVBQVU7QUFDWCxVQUFVLDRCQUE0QixFQUFFLG1CQUFPLENBQUMsNkRBQTJDO0FBQzNGO0FBQ0EsRUFBRTtBQUNGLEM7Ozs7Ozs7Ozs7OztBQ1p5RDtBQ0NKO0FER3JELDhFQUE0QixvREFBZ0IsQ0FBQztJQUMzQyxNQUFNLEVBQUUsU0FBUztJQUNqQixLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtRQUNuQyxRQUFRLEVBQUUsQ0FBQztRQ0piLE1BQU0sS0FBSyxHQUFHLHdDQUFHLENBQ2YsS0FBSyxDQUFDLElBQUk7YUFDUCxJQUFJLENBQUMsQ0FBQzthQUNOLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLFFBQVEsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQzFDO1FEUUQsTUFBTSxZQUFZLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxhQUFhLEtBQUssT0FBTyw4Q0FBYSxFQUFDLENBQUMsRUFBRTtRQUM1RSxNQUFNLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDO1FBQzFGLE9BQU8sWUFBWTtJQUNuQixDQUFDO0NBRUEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUVwQnVEO0FDT2hDO0FBQ1U7QURHbkMsOEVBQTRCLG9EQUFnQixDQUFDO0lBQzNDLE1BQU0sRUFBRSxNQUFNO0lBQ2QsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7UUFDbkMsUUFBUSxFQUFFLENBQUM7UUNKYixNQUFNLE9BQU8sR0FBRyx3Q0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLE9BQU8sR0FBRyw2Q0FBUSxDQUFDLEdBQUcsRUFBRTtZQUM1QixPQUFPLHNCQUFzQixPQUFPLENBQUMsS0FBSyxFQUFFO1FBQzlDLENBQUMsQ0FBQztRQUVGLFNBQVMsVUFBVTtZQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDO1FBQzdDO1FBRUEsSUFBSSxRQUFhO1FBQ2pCLDhDQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7WUFDdEIsUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxDQUFDO1FBQ3BELENBQUMsQ0FBQztRQUVGLGdEQUFXLENBQUMsR0FBRyxFQUFFO1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7WUFDeEIsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDLENBQUM7UURRRixNQUFNLFlBQVksR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksUUFBUSxLQUFLLE9BQU8sUUFBUSxFQUFDLENBQUMsRUFBRSxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUksUUFBUSxHQUFHLENBQUMsRUFBQyxDQUFDLEVBQUUsSUFBSSxXQUFXLEtBQUssT0FBTyw0Q0FBVyxFQUFDLENBQUMsRUFBRSxPQUFPLHdEQUFFO1FBQzlLLE1BQU0sQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDMUYsT0FBTyxZQUFZO0lBQ25CLENBQUM7Q0FFQSxDQUFDOzs7Ozs7Ozs7Ozs7O0FFekNpSztBQUU1SixTQUFTLE1BQU0sQ0FBQyxJQUFTLEVBQUMsTUFBVyxFQUFDLE1BQVcsRUFBQyxNQUFXLEVBQUMsS0FBVSxFQUFDLFFBQWE7SUFDM0YsTUFBTSxnQkFBZ0IsR0FBRyxxREFBaUIsQ0FBQyxPQUFPLENBQUU7SUFDcEQsTUFBTSxzQkFBc0IsR0FBRyxxREFBaUIsQ0FBQyxhQUFhLENBQUU7SUFDaEUsTUFBTSxxQkFBcUIsR0FBRyxxREFBaUIsQ0FBQyxZQUFZLENBQUU7SUFDOUQsTUFBTSxtQkFBbUIsR0FBRyxxREFBaUIsQ0FBQyxVQUFVLENBQUU7SUFDMUQsTUFBTSxlQUFlLEdBQUcscURBQWlCLENBQUMsTUFBTSxDQUFFO0lBRWxELE9BQU8sQ0FBQyw4Q0FBVSxFQUFFLEVIRXBCLGlEQXVCTyxtQkF2QkQsZUFBZSxFQUFDLE1BQU07UUdEMUIsT0FBTyxFQUFFLDRDQUFRLENIRWpCLEdBcUJhO1lBckJiLGlEQXFCYSx5QkFyQkQsSUFBSSxFQUFDLFNBQVM7Z0JHQXRCLE9BQU8sRUFBRSw0Q0FBUSxDSENuQixHQUlFO29CQUpGLGlEQUlFO3dCQUhBLElBQUksRUFBQyxTQUFTO3dCQUNiLEtBQUcsRUFBRSxvQkFBYTt3QkFDbkIsS0FBSyxFQUFDLHlEQUF5RDtxQkdDNUQsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CSEV0QyxpREFhYzt3QkFiRCxHQUFHLEVBQUMsR0FBRzt3QkFBQyxLQUFLLEVBQUMsNEJBQTRCO3FCR0VsRCxFQUFFO3dCQUNELE9BQU8sRUFBRSw0Q0FBUSxDSEZyQixHQVdXOzRCQVhYLGlEQVdXO2dDQVZSLEtBQUssRUFBRSxZQUFLO2dDQUNiLGNBQWMsRUFBQyxhQUFhO2dDQUM1QixLQUFLLEVBQUMsZ0JBQWdCOzZCR0lqQixFQUFFO2dDSEZJLE9BQU8sK0NBQ2hCLENBR2EsRUFKTyxJQUFJO29DQUN4QixpREFHYTt3Q0FIRCxPQUFPLEVBQUMsU0FBUzt3Q0FBQyxLQUFLLEVBQUMsTUFBTTtxQ0dNbkMsRUFBRTt3Q0FDRCxPQUFPLEVBQUUsNENBQVEsQ0hOdkIsR0FBdUQ7NENBQXZELGlEQUF1RDtnREFBL0MsSUFBSSxFQUFFLElBQUk7Z0RBQUUsS0FBSyxFQUFDLDBCQUEwQjs2Q0dVM0MsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRDSFR6QyxpREFBNkQ7Z0RBQWhELEdBQUcsRUFBQyxHQUFHO2dEQUFDLEtBQUssRUFBQywrQkFBK0I7NkNHYWpELENBQUM7eUNBQ0gsQ0FBQzt3Q0FDRixDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWE7cUNBQ25CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDO2lDQUM3QixDQUFDO2dDQUNGLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWTs2QkFDbEIsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7eUJBQzdCLENBQUM7d0JBQ0YsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZO3FCQUNsQixDQUFDO2lCQUNILENBQUM7Z0JBQ0YsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZO2FBQ2xCLENBQUM7U0FDSCxDQUFDO1FBQ0YsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZO0tBQ2xCLENBQUMsQ0FBQztBQUNMLENBQUM7Ozs7Ozs7Ozs7Ozs7QUN6RHVNO0FBRWpNLFNBQVMsTUFBTSxDQUFDLElBQVMsRUFBQyxNQUFXLEVBQUMsTUFBVyxFQUFDLE1BQVcsRUFBQyxLQUFVLEVBQUMsUUFBYTtJQUMzRixNQUFNLGdCQUFnQixHQUFHLHFEQUFpQixDQUFDLE9BQU8sQ0FBRTtJQUNwRCxNQUFNLG9CQUFvQixHQUFHLHFEQUFpQixDQUFDLFdBQVcsQ0FBRTtJQUM1RCxNQUFNLGlCQUFpQixHQUFHLHFEQUFpQixDQUFDLFFBQVEsQ0FBRTtJQUN0RCxNQUFNLHFCQUFxQixHQUFHLHFEQUFpQixDQUFDLFlBQVksQ0FBRTtJQUM5RCxNQUFNLGVBQWUsR0FBRyxxREFBaUIsQ0FBQyxNQUFNLENBQUU7SUFDbEQsTUFBTSxnQkFBZ0IsR0FBRyxxREFBaUIsQ0FBQyxPQUFPLENBQUU7SUFFcEQsT0FBTyxDQUFDLDhDQUFVLEVBQUUsRUZzQnBCLGlEQXdCUTtRRTdDTixPQUFPLEVBQUUsNENBQVEsQ0ZzQmpCLEdBc0JPO1lBdEJQLGlEQXNCTztnQkUxQ0gsT0FBTyxFQUFFLDRDQUFRLENGcUJuQixHQUVZO29CQUZaLGlEQUVZO3dCRXJCTixPQUFPLEVBQUUsNENBQVEsQ0ZvQnJCLEdBQStDOzRCQUEvQyxpREFBK0M7Z0NBQXhDLElBQUksRUFBQyxNQUFNO2dDQUFDLEtBQUssRUFBQyxtQkFBbUI7NkJFaEJyQyxDQUFDO3lCQUNILENBQUM7d0JBQ0YsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZO3FCQUNsQixDQUFDO29CRmdCTixpREFnQmE7d0JBaEJELElBQUksRUFBQyxrQkFBa0I7d0JBQUMsS0FBSyxFQUFDLE1BQU07cUJFWjNDLEVBQUU7d0JBQ0QsT0FBTyxFQUFFLDRDQUFRLENGWXJCLEdBS0U7NEJBTEYsaURBS0U7Z0NBSkEsR0FBRyxFQUFDLEdBQUc7Z0NBQ1AsS0FBSyxFQUFDLGdEQUFnRDtnQ0FDckQsSUFBSSxFQUFFLGNBQU87Z0NBQ2IsS0FBRyxFQUFFLGlCQUFVOzZCRVZYLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkZhdkMsaURBT1M7Z0NBTlAsR0FBRyxFQUFDLEdBQUc7Z0NBQ04sS0FBRyx5Q0FBRSxrQkFBVyxDQUFDLGNBQU87Z0NBQ3pCLEtBQUssRUFBQyw2REFBNkQ7Z0NBQ25FLG1CQUFtQixFQUFDLFFBQVE7NkJFWHZCLEVBQUU7Z0NBQ0QsT0FBTyxFQUFFLDRDQUFRLENGV3hCLEdBRUQ7d0NFWlUsb0RBQWdCLENGVXpCLGdCQUVEO3FDRVhTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ0wsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZOzZCQUNsQixDQUFDO3lCQUNILENBQUM7d0JBQ0YsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZO3FCQUNsQixDQUFDO2lCQUNILENBQUM7Z0JBQ0YsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZO2FBQ2xCLENBQUM7U0FDSCxDQUFDO1FBQ0YsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZO0tBQ2xCLENBQUMsQ0FBQztBQUNMLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ3REMkU7QUFDUDtBQUNMOztBQUVoRSxDQUFnRjtBQUNoRixpQ0FBaUMseUZBQWUsQ0FBQyx1RkFBTSxhQUFhLHNGQUFNO0FBQzFFO0FBQ0EsSUFBSSxJQUFVO0FBQ2Q7QUFDQTtBQUNBLEVBQUUsaUJBQWlCO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxpQkFBaUIsQ0FBQyxvRUFBcUQsRUFBRTtBQUFBO0FBQzNFLDZCQUE2QixzRkFBTTtBQUNuQyxHQUFHOztBQUVIOzs7QUFHQSxpRUFBZSxXOzs7Ozs7Ozs7Ozs7Ozs7QUN0QjBEO0FBQ1A7QUFDTDs7QUFFN0QsQ0FBK0Q7O0FBRWlCO0FBQ2hGLGlDQUFpQyx5RkFBZSxDQUFDLG9GQUFNLGFBQWEsbUZBQU07QUFDMUU7QUFDQSxJQUFJLElBQVU7QUFDZDtBQUNBO0FBQ0EsRUFBRSxpQkFBaUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLGlCQUFpQixDQUFDLGlFQUFrRCxFQUFFO0FBQUE7QUFDeEUsNkJBQTZCLG1GQUFNO0FBQ25DLEdBQUc7O0FBRUg7OztBQUdBLGlFQUFlLFc7Ozs7Ozs7Ozs7OztBQ3hCOFosQzs7Ozs7Ozs7Ozs7O0FDQTZDLEM7Ozs7Ozs7Ozs7OztBQ0FILEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUdBdmQsMkMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hcHAvLi9zcmMvYXBwLnRzIiwid2VicGFjazovL2FwcC8uL3NyYy9jb21wb25lbnRzL0hvbWUudnVlPzM0ODgiLCJ3ZWJwYWNrOi8vYXBwLy4vc3JjL2FwcC5jc3MiLCJ3ZWJwYWNrOi8vYXBwLy4vc3JjL2NvbXBvbmVudHMvRGV0YWlscy52dWU/YTc5MCIsIndlYnBhY2s6Ly9hcHAvLi9zcmMvY29tcG9uZW50cy9EZXRhaWxzLnZ1ZSIsIndlYnBhY2s6Ly9hcHAvLi9zcmMvY29tcG9uZW50cy9Ib21lLnZ1ZT84MTcwIiwid2VicGFjazovL2FwcC8uL3NyYy9jb21wb25lbnRzL0hvbWUudnVlIiwid2VicGFjazovL2FwcC8uL3NyYy9jb21wb25lbnRzL0RldGFpbHMudnVlP2YzOGYiLCJ3ZWJwYWNrOi8vYXBwLy4vc3JjL2NvbXBvbmVudHMvSG9tZS52dWU/MGJkNSIsIndlYnBhY2s6Ly9hcHAvLi9zcmMvY29tcG9uZW50cy9EZXRhaWxzLnZ1ZT83MmIwIiwid2VicGFjazovL2FwcC8uL3NyYy9jb21wb25lbnRzL0hvbWUudnVlP2E0MDQiLCJ3ZWJwYWNrOi8vYXBwLy4vc3JjL2NvbXBvbmVudHMvSG9tZS52dWU/NTY3NCIsIndlYnBhY2s6Ly9hcHAvLi9zcmMvY29tcG9uZW50cy9EZXRhaWxzLnZ1ZT81NGJkIiwid2VicGFjazovL2FwcC8uL3NyYy9jb21wb25lbnRzL0hvbWUudnVlPzNiZWMiLCJ3ZWJwYWNrOi8vYXBwLy4vc3JjL2NvbXBvbmVudHMvRGV0YWlscy52dWU/YmIyNSIsIndlYnBhY2s6Ly9hcHAvLi9zcmMvY29tcG9uZW50cy9Ib21lLnZ1ZT9lOTM5Iiwid2VicGFjazovL2FwcC9leHRlcm5hbCBjb21tb25qcyBcIn4vcGFja2FnZS5qc29uXCIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQXBwIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXZ1ZSc7XG5pbXBvcnQgSG9tZSBmcm9tICcuL2NvbXBvbmVudHMvSG9tZS52dWUnO1xuXG5jcmVhdGVBcHAoSG9tZSkuc3RhcnQoKTtcbiIsIi8qIENTUzJKU09OICovXG5cbmNvbnN0IF9fX0NTUzJKU09OX0xPQURFUl9FWFBPUlRfX18gPSB7XCJ0eXBlXCI6XCJzdHlsZXNoZWV0XCIsXCJzdHlsZXNoZWV0XCI6e1wicnVsZXNcIjpbe1widHlwZVwiOlwiY29tbWVudFwiLFwiY29tbWVudFwiOlwiIC5pbmZvIHtcXG4gICAgZm9udC1zaXplOiAyMDtcXG4gIH0gXCJ9XSxcInBhcnNpbmdFcnJvcnNcIjpbXX19XG5leHBvcnQgZGVmYXVsdCBfX19DU1MySlNPTl9MT0FERVJfRVhQT1JUX19fXG5jb25zdCB7IGFkZFRhZ2dlZEFkZGl0aW9uYWxDU1MgfSA9IHJlcXVpcmUoXCJAbmF0aXZlc2NyaXB0L2NvcmUvdWkvc3R5bGluZy9zdHlsZS1zY29wZVwiKTtcbmFkZFRhZ2dlZEFkZGl0aW9uYWxDU1MoX19fQ1NTMkpTT05fTE9BREVSX0VYUE9SVF9fXywgXCIvdmFyL3d3dy9wcm9qZWN0cy9vZmZsaW5lLWFwcHMvc3JjL2NvbXBvbmVudHMvSG9tZS52dWVcIilcbmlmKG1vZHVsZS5ob3QpIHtcblx0bW9kdWxlLmhvdC5hY2NlcHQoKVxuXHRtb2R1bGUuaG90LmRpc3Bvc2UoKCkgPT4ge1xuXHRcdGNvbnN0IHsgcmVtb3ZlVGFnZ2VkQWRkaXRpb25hbENTUyB9ID0gcmVxdWlyZShcIkBuYXRpdmVzY3JpcHQvY29yZS91aS9zdHlsaW5nL3N0eWxlLXNjb3BlXCIpO1xuXHRcdHJlbW92ZVRhZ2dlZEFkZGl0aW9uYWxDU1MoXCIvdmFyL3d3dy9wcm9qZWN0cy9vZmZsaW5lLWFwcHMvc3JjL2NvbXBvbmVudHMvSG9tZS52dWVcIilcblx0fSlcbn0iLCIvKiBDU1MySlNPTiAqL1xuXG5jb25zdCBfX19DU1MySlNPTl9MT0FERVJfRVhQT1JUX19fID0ge1widHlwZVwiOlwic3R5bGVzaGVldFwiLFwic3R5bGVzaGVldFwiOntcInJ1bGVzXCI6W3tcInR5cGVcIjpcImNvbW1lbnRcIixcImNvbW1lbnRcIjpcIiEgdGFpbHdpbmRjc3MgdjQuMy4xIHwgTUlUIExpY2Vuc2UgfCBodHRwczovL3RhaWx3aW5kY3NzLmNvbSBcIn0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLm5zLXJvb3RcIixcIi5ucy1tb2RhbFwiLFwiLm5zLXJvb3RcIixcIi5ucy1tb2RhbFwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tZm9udC1zYW5zXCIsXCJ2YWx1ZVwiOlwidWktc2Fucy1zZXJpZixzeXN0ZW0tdWksLWFwcGxlLXN5c3RlbSxTZWdvZSBVSSxSb2JvdG8sVWJ1bnR1LENhbnRhcmVsbCxOb3RvIFNhbnMsIHNhbnMtc2VyaWYsIFxcXCJBcHBsZSBDb2xvciBFbW9qaVxcXCIsXFxuICAgICAgXFxcIlNlZ29lIFVJIEVtb2ppXFxcIiwgXFxcIlNlZ29lIFVJIFN5bWJvbFxcXCIsIFxcXCJOb3RvIENvbG9yIEVtb2ppXFxcIlwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tZm9udC1tb25vXCIsXCJ2YWx1ZVwiOlwidWktbW9ub3NwYWNlLCBTRk1vbm8tUmVndWxhciwgTWVubG8sIE1vbmFjbywgQ29uc29sYXMsIFxcXCJMaWJlcmF0aW9uIE1vbm9cXFwiLFxcbiAgICAgIFxcXCJDb3VyaWVyIE5ld1xcXCIsIG1vbm9zcGFjZVwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tY29sb3ItYmx1ZS00MDBcIixcInZhbHVlXCI6XCJyZ2IoODYsIDE2MiwgMjU1KVwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tY29sb3ItZ3JheS01MDBcIixcInZhbHVlXCI6XCJyZ2IoMTA2LCAxMTQsIDEzMClcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCItLWNvbG9yLWdyYXktOTAwXCIsXCJ2YWx1ZVwiOlwicmdiKDE2LCAyNCwgNDApXCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiLS1jb2xvci13aGl0ZVwiLFwidmFsdWVcIjpcIiNmZmZcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCItLXNwYWNpbmdcIixcInZhbHVlXCI6XCI0XCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiLS10ZXh0LWxnXCIsXCJ2YWx1ZVwiOlwiMThcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCItLXRleHQtbGctLWxpbmUtaGVpZ2h0XCIsXCJ2YWx1ZVwiOlwiY2FsYygxLjc1IC8gMS4xMjUpXCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiLS10ZXh0LXhsXCIsXCJ2YWx1ZVwiOlwiMjBcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCItLXRleHQteGwtLWxpbmUtaGVpZ2h0XCIsXCJ2YWx1ZVwiOlwiY2FsYygxLjc1IC8gMS4yNSlcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCItLXRleHQtMnhsXCIsXCJ2YWx1ZVwiOlwiMjRcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCItLXRleHQtMnhsLS1saW5lLWhlaWdodFwiLFwidmFsdWVcIjpcImNhbGMoMiAvIDEuNSlcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCItLXRleHQtM3hsXCIsXCJ2YWx1ZVwiOlwiMzBcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCItLXRleHQtM3hsLS1saW5lLWhlaWdodFwiLFwidmFsdWVcIjpcImNhbGMoMi4yNSAvIDEuODc1KVwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tZm9udC13ZWlnaHQtYm9sZFwiLFwidmFsdWVcIjpcIjcwMFwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tcmFkaXVzLWxnXCIsXCJ2YWx1ZVwiOlwiOFwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tcmFkaXVzLTN4bFwiLFwidmFsdWVcIjpcIjI0XCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiLS1kZWZhdWx0LWZvbnQtZmFtaWx5XCIsXCJ2YWx1ZVwiOlwidmFyKC0tZm9udC1zYW5zKVwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tZGVmYXVsdC1tb25vLWZvbnQtZmFtaWx5XCIsXCJ2YWx1ZVwiOlwidmFyKC0tZm9udC1tb25vKVwifV19LHtcInR5cGVcIjpcInN1cHBvcnRzXCIsXCJzdXBwb3J0c1wiOlwiKGNvbG9yOiBjb2xvcihkaXNwbGF5LXAzIDAgMCAwJSkpXCIsXCJydWxlc1wiOlt7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCIubnMtcm9vdFwiLFwiLm5zLW1vZGFsXCIsXCIubnMtcm9vdFwiLFwiLm5zLW1vZGFsXCJdLFwiZGVjbGFyYXRpb25zXCI6W3tcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiLS1jb2xvci1ibHVlLTQwMFwiLFwidmFsdWVcIjpcInJnYig4NiwgMTYyLCAyNTUpXCJ9XX0se1widHlwZVwiOlwibWVkaWFcIixcIm1lZGlhXCI6XCIoY29sb3ItZ2FtdXQ6IHAzKVwiLFwicnVsZXNcIjpbe1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLm5zLXJvb3RcIixcIi5ucy1tb2RhbFwiLFwiLm5zLXJvb3RcIixcIi5ucy1tb2RhbFwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tY29sb3ItYmx1ZS00MDBcIixcInZhbHVlXCI6XCJjb2xvcihkaXNwbGF5LXAzIDAuMzk3NDQgMC42MjgxMyAwLjk5MjEyKVwifV19XX1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCIqXCIsXCI6OmFmdGVyXCIsXCI6OmJlZm9yZVwiLFwiOjpiYWNrZHJvcFwiLFwiOjpmaWxlLXNlbGVjdG9yLWJ1dHRvblwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIm1hcmdpblwiLFwidmFsdWVcIjpcIjBcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJwYWRkaW5nXCIsXCJ2YWx1ZVwiOlwiMFwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcImh0bWxcIixcIi5ucy1yb290XCIsXCIubnMtbW9kYWxcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJsaW5lLWhlaWdodFwiLFwidmFsdWVcIjpcIjEuNVwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImZvbnQtZmFtaWx5XCIsXCJ2YWx1ZVwiOlwidWktc2Fucy1zZXJpZixzeXN0ZW0tdWksLWFwcGxlLXN5c3RlbSxTZWdvZSBVSSxSb2JvdG8sVWJ1bnR1LENhbnRhcmVsbCxOb3RvIFNhbnMsIHNhbnMtc2VyaWYsIFxcXCJBcHBsZSBDb2xvciBFbW9qaVxcXCIsIFxcXCJTZWdvZSBVSSBFbW9qaVxcXCIsIFxcXCJTZWdvZSBVSSBTeW1ib2xcXFwiLCBcXFwiTm90byBDb2xvciBFbW9qaVxcXCJcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJmb250LWZhbWlseVwiLFwidmFsdWVcIjpcInZhcigtLWRlZmF1bHQtZm9udC1mYW1pbHksIHVpLXNhbnMtc2VyaWYsIHN5c3RlbS11aSwgc2Fucy1zZXJpZiwgXFxcIkFwcGxlIENvbG9yIEVtb2ppXFxcIiwgXFxcIlNlZ29lIFVJIEVtb2ppXFxcIiwgXFxcIlNlZ29lIFVJIFN5bWJvbFxcXCIsIFxcXCJOb3RvIENvbG9yIEVtb2ppXFxcIilcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJmb250LXZhcmlhdGlvbi1zZXR0aW5nc1wiLFwidmFsdWVcIjpcIm5vcm1hbFwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImZvbnQtdmFyaWF0aW9uLXNldHRpbmdzXCIsXCJ2YWx1ZVwiOlwidmFyKC0tZGVmYXVsdC1mb250LXZhcmlhdGlvbi1zZXR0aW5ncywgbm9ybWFsKVwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcImhyXCJdLFwiZGVjbGFyYXRpb25zXCI6W3tcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiaGVpZ2h0XCIsXCJ2YWx1ZVwiOlwiMFwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImNvbG9yXCIsXCJ2YWx1ZVwiOlwiaW5oZXJpdFwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImJvcmRlci10b3Atd2lkdGhcIixcInZhbHVlXCI6XCIxcHhcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCJhYmJyW3RpdGxlXVwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcInRleHQtZGVjb3JhdGlvblwiLFwidmFsdWVcIjpcInVuZGVybGluZVwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcImgxXCIsXCJoMlwiLFwiaDNcIixcImg0XCIsXCJoNVwiLFwiaDZcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJmb250LXNpemVcIixcInZhbHVlXCI6XCJpbmhlcml0XCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiZm9udC13ZWlnaHRcIixcInZhbHVlXCI6XCJpbmhlcml0XCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiYVwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImNvbG9yXCIsXCJ2YWx1ZVwiOlwiaW5oZXJpdFwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcImJcIixcInN0cm9uZ1wiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImZvbnQtd2VpZ2h0XCIsXCJ2YWx1ZVwiOlwiYm9sZGVyXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiY29kZVwiLFwia2JkXCIsXCJzYW1wXCIsXCJwcmVcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJmb250LWZhbWlseVwiLFwidmFsdWVcIjpcInVpLW1vbm9zcGFjZSwgU0ZNb25vLVJlZ3VsYXIsIE1lbmxvLCBNb25hY28sIENvbnNvbGFzLCBcXFwiTGliZXJhdGlvbiBNb25vXFxcIiwgXFxcIkNvdXJpZXIgTmV3XFxcIiwgbW9ub3NwYWNlXCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiZm9udC1mYW1pbHlcIixcInZhbHVlXCI6XCJ2YXIoLS1kZWZhdWx0LW1vbm8tZm9udC1mYW1pbHksIHVpLW1vbm9zcGFjZSwgU0ZNb25vLVJlZ3VsYXIsIE1lbmxvLCBNb25hY28sIENvbnNvbGFzLCBcXFwiTGliZXJhdGlvbiBNb25vXFxcIiwgXFxcIkNvdXJpZXIgTmV3XFxcIiwgbW9ub3NwYWNlKVwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImZvbnQtdmFyaWF0aW9uLXNldHRpbmdzXCIsXCJ2YWx1ZVwiOlwibm9ybWFsXCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiZm9udC12YXJpYXRpb24tc2V0dGluZ3NcIixcInZhbHVlXCI6XCJ2YXIoLS1kZWZhdWx0LW1vbm8tZm9udC12YXJpYXRpb24tc2V0dGluZ3MsIG5vcm1hbClcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJmb250LXNpemVcIixcInZhbHVlXCI6XCIxNlwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcInNtYWxsXCJdLFwiZGVjbGFyYXRpb25zXCI6W3tcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiZm9udC1zaXplXCIsXCJ2YWx1ZVwiOlwiODAlXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wic3ViXCIsXCJzdXBcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJmb250LXNpemVcIixcInZhbHVlXCI6XCI3NSVcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJsaW5lLWhlaWdodFwiLFwidmFsdWVcIjpcIjBcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCJ0YWJsZVwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImJvcmRlci1jb2xvclwiLFwidmFsdWVcIjpcImluaGVyaXRcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCJpbWdcIixcInN2Z1wiLFwidmlkZW9cIixcImNhbnZhc1wiLFwiYXVkaW9cIixcImlmcmFtZVwiLFwiZW1iZWRcIixcIm9iamVjdFwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcInZlcnRpY2FsLWFsaWduXCIsXCJ2YWx1ZVwiOlwiY2VudGVyXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiaW1nXCIsXCJ2aWRlb1wiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImhlaWdodFwiLFwidmFsdWVcIjpcImF1dG9cIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCJidXR0b25cIixcImlucHV0XCIsXCJzZWxlY3RcIixcIm9wdGdyb3VwXCIsXCJ0ZXh0YXJlYVwiLFwiOjpmaWxlLXNlbGVjdG9yLWJ1dHRvblwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImZvbnRcIixcInZhbHVlXCI6XCJpbmhlcml0XCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiZm9udC12YXJpYXRpb24tc2V0dGluZ3NcIixcInZhbHVlXCI6XCJpbmhlcml0XCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwibGV0dGVyLXNwYWNpbmdcIixcInZhbHVlXCI6XCJpbmhlcml0XCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiY29sb3JcIixcInZhbHVlXCI6XCJpbmhlcml0XCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiYm9yZGVyLXJhZGl1c1wiLFwidmFsdWVcIjpcIjBcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJiYWNrZ3JvdW5kLWNvbG9yXCIsXCJ2YWx1ZVwiOlwidHJhbnNwYXJlbnRcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJvcGFjaXR5XCIsXCJ2YWx1ZVwiOlwiMVwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcInNlbGVjdFttdWx0aXBsZV0gb3B0Z3JvdXBcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJmb250LXdlaWdodFwiLFwidmFsdWVcIjpcImJvbGRlclwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcInNlbGVjdFtzaXplXSBvcHRncm91cFwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImZvbnQtd2VpZ2h0XCIsXCJ2YWx1ZVwiOlwiYm9sZGVyXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiOjpmaWxlLXNlbGVjdG9yLWJ1dHRvblwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIm1hcmdpbi1yaWdodFwiLFwidmFsdWVcIjpcIjRweFwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIjo6LXdlYmtpdC1kYXRlLWFuZC10aW1lLXZhbHVlXCJdLFwiZGVjbGFyYXRpb25zXCI6W3tcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwibWluLWhlaWdodFwiLFwidmFsdWVcIjpcIjFsaFwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIjo6LXdlYmtpdC1kYXRldGltZS1lZGl0LWZpZWxkcy13cmFwcGVyXCJdLFwiZGVjbGFyYXRpb25zXCI6W3tcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwicGFkZGluZ1wiLFwidmFsdWVcIjpcIjBcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCI6Oi13ZWJraXQtZGF0ZXRpbWUtZWRpdFwiLFwiOjotd2Via2l0LWRhdGV0aW1lLWVkaXQteWVhci1maWVsZFwiLFwiOjotd2Via2l0LWRhdGV0aW1lLWVkaXQtbW9udGgtZmllbGRcIixcIjo6LXdlYmtpdC1kYXRldGltZS1lZGl0LWRheS1maWVsZFwiLFwiOjotd2Via2l0LWRhdGV0aW1lLWVkaXQtaG91ci1maWVsZFwiLFwiOjotd2Via2l0LWRhdGV0aW1lLWVkaXQtbWludXRlLWZpZWxkXCIsXCI6Oi13ZWJraXQtZGF0ZXRpbWUtZWRpdC1zZWNvbmQtZmllbGRcIixcIjo6LXdlYmtpdC1kYXRldGltZS1lZGl0LW1pbGxpc2Vjb25kLWZpZWxkXCIsXCI6Oi13ZWJraXQtZGF0ZXRpbWUtZWRpdC1tZXJpZGllbS1maWVsZFwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcInBhZGRpbmctdG9wXCIsXCJ2YWx1ZVwiOlwiMFwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcInBhZGRpbmctYm90dG9tXCIsXCJ2YWx1ZVwiOlwiMFwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIjo6LXdlYmtpdC1jYWxlbmRhci1waWNrZXItaW5kaWNhdG9yXCJdLFwiZGVjbGFyYXRpb25zXCI6W3tcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwibGluZS1oZWlnaHRcIixcInZhbHVlXCI6XCIxXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiOi1tb3otdWktaW52YWxpZFwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImJveC1zaGFkb3dcIixcInZhbHVlXCI6XCJub25lXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiOjotd2Via2l0LWlubmVyLXNwaW4tYnV0dG9uXCIsXCI6Oi13ZWJraXQtb3V0ZXItc3Bpbi1idXR0b25cIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJoZWlnaHRcIixcInZhbHVlXCI6XCJhdXRvXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLmNvbnRhaW5lclwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIndpZHRoXCIsXCJ2YWx1ZVwiOlwiMTAwJVwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIi5jb250YWluZXJcXFxcIVwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIndpZHRoXCIsXCJ2YWx1ZVwiOlwiMTAwJSAhaW1wb3J0YW50XCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLm10LTRcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJtYXJnaW4tdG9wXCIsXCJ2YWx1ZVwiOlwiY2FsYyh2YXIoLS1zcGFjaW5nKSAqIDQpXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLmgtNVwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImhlaWdodFwiLFwidmFsdWVcIjpcImNhbGModmFyKC0tc3BhY2luZykgKiA1KVwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIi53LTVcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJ3aWR0aFwiLFwidmFsdWVcIjpcImNhbGModmFyKC0tc3BhY2luZykgKiA1KVwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIi50cmFuc2Zvcm1cIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJ0cmFuc2Zvcm1cIixcInZhbHVlXCI6XCJcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJ0cmFuc2Zvcm1cIixcInZhbHVlXCI6XCJ2YXIoLS10dy1yb3RhdGUteCwpIHZhcigtLXR3LXJvdGF0ZS15LCkgdmFyKC0tdHctcm90YXRlLXosKSB2YXIoLS10dy1za2V3LXgsKSB2YXIoLS10dy1za2V3LXksKVwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIi5yb3VuZGVkLWZ1bGxcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJib3JkZXItcmFkaXVzXCIsXCJ2YWx1ZVwiOlwiY2FsYyhpbmZpbml0eSAqIDFweClcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCIucm91bmRlZC1sZ1wiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImJvcmRlci1yYWRpdXNcIixcInZhbHVlXCI6XCJ2YXIoLS1yYWRpdXMtbGcpXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLnJvdW5kZWQtdC0zeGxcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJib3JkZXItdG9wLWxlZnQtcmFkaXVzXCIsXCJ2YWx1ZVwiOlwidmFyKC0tcmFkaXVzLTN4bClcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJib3JkZXItdG9wLXJpZ2h0LXJhZGl1c1wiLFwidmFsdWVcIjpcInZhcigtLXJhZGl1cy0zeGwpXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLmJvcmRlci0yXCJdLFwiZGVjbGFyYXRpb25zXCI6W3tcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiYm9yZGVyLXdpZHRoXCIsXCJ2YWx1ZVwiOlwiMnB4XCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLmJvcmRlci1ibHVlLTQwMFwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImJvcmRlci1jb2xvclwiLFwidmFsdWVcIjpcInZhcigtLWNvbG9yLWJsdWUtNDAwKVwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIi5iZy1cXFxcW1xcXFwjNjVhZGYxXFxcXF1cIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJiYWNrZ3JvdW5kLWNvbG9yXCIsXCJ2YWx1ZVwiOlwiIzY1YWRmMVwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIi5iZy10cmFuc3BhcmVudFwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImJhY2tncm91bmQtY29sb3JcIixcInZhbHVlXCI6XCJ0cmFuc3BhcmVudFwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIi5iZy13aGl0ZVwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImJhY2tncm91bmQtY29sb3JcIixcInZhbHVlXCI6XCJ2YXIoLS1jb2xvci13aGl0ZSlcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCIucHgtNFwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcInBhZGRpbmctbGVmdFwiLFwidmFsdWVcIjpcImNhbGModmFyKC0tc3BhY2luZykgKiA0KVwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcInBhZGRpbmctcmlnaHRcIixcInZhbHVlXCI6XCJjYWxjKHZhcigtLXNwYWNpbmcpICogNClcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCIucHktMlwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcInBhZGRpbmctdG9wXCIsXCJ2YWx1ZVwiOlwiY2FsYyh2YXIoLS1zcGFjaW5nKSAqIDIpXCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwicGFkZGluZy1ib3R0b21cIixcInZhbHVlXCI6XCJjYWxjKHZhcigtLXNwYWNpbmcpICogMilcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCIucHktM1wiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcInBhZGRpbmctdG9wXCIsXCJ2YWx1ZVwiOlwiY2FsYyh2YXIoLS1zcGFjaW5nKSAqIDMpXCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwicGFkZGluZy1ib3R0b21cIixcInZhbHVlXCI6XCJjYWxjKHZhcigtLXNwYWNpbmcpICogMylcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCIucHktMTBcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJwYWRkaW5nLXRvcFwiLFwidmFsdWVcIjpcImNhbGModmFyKC0tc3BhY2luZykgKiAxMClcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJwYWRkaW5nLWJvdHRvbVwiLFwidmFsdWVcIjpcImNhbGModmFyKC0tc3BhY2luZykgKiAxMClcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCIudGV4dC1jZW50ZXJcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJ0ZXh0LWFsaWduXCIsXCJ2YWx1ZVwiOlwiY2VudGVyXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLmFsaWduLW1pZGRsZVwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcInZlcnRpY2FsLWFsaWduXCIsXCJ2YWx1ZVwiOlwiY2VudGVyXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLnRleHQtMnhsXCJdLFwiZGVjbGFyYXRpb25zXCI6W3tcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiZm9udC1zaXplXCIsXCJ2YWx1ZVwiOlwidmFyKC0tdGV4dC0yeGwpXCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwibGluZS1oZWlnaHRcIixcInZhbHVlXCI6XCJ2YXIoLS10dy1sZWFkaW5nLCB2YXIoLS10ZXh0LTJ4bC0tbGluZS1oZWlnaHQpKVwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIi50ZXh0LTN4bFwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImZvbnQtc2l6ZVwiLFwidmFsdWVcIjpcInZhcigtLXRleHQtM3hsKVwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImxpbmUtaGVpZ2h0XCIsXCJ2YWx1ZVwiOlwidmFyKC0tdHctbGVhZGluZywgdmFyKC0tdGV4dC0zeGwtLWxpbmUtaGVpZ2h0KSlcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCIudGV4dC1sZ1wiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImZvbnQtc2l6ZVwiLFwidmFsdWVcIjpcInZhcigtLXRleHQtbGcpXCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwibGluZS1oZWlnaHRcIixcInZhbHVlXCI6XCJ2YXIoLS10dy1sZWFkaW5nLCB2YXIoLS10ZXh0LWxnLS1saW5lLWhlaWdodCkpXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLnRleHQteGxcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJmb250LXNpemVcIixcInZhbHVlXCI6XCJ2YXIoLS10ZXh0LXhsKVwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImxpbmUtaGVpZ2h0XCIsXCJ2YWx1ZVwiOlwidmFyKC0tdHctbGVhZGluZywgdmFyKC0tdGV4dC14bC0tbGluZS1oZWlnaHQpKVwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIi5mb250LWJvbGRcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCItLXR3LWZvbnQtd2VpZ2h0XCIsXCJ2YWx1ZVwiOlwidmFyKC0tZm9udC13ZWlnaHQtYm9sZClcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJmb250LXdlaWdodFwiLFwidmFsdWVcIjpcInZhcigtLWZvbnQtd2VpZ2h0LWJvbGQpXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLnRleHQtZ3JheS01MDBcIl0sXCJkZWNsYXJhdGlvbnNcIjpbe1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJjb2xvclwiLFwidmFsdWVcIjpcInZhcigtLWNvbG9yLWdyYXktNTAwKVwifV19LHtcInR5cGVcIjpcInJ1bGVcIixcInNlbGVjdG9yc1wiOltcIi50ZXh0LWdyYXktOTAwXCJdLFwiZGVjbGFyYXRpb25zXCI6W3tcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiY29sb3JcIixcInZhbHVlXCI6XCJ2YXIoLS1jb2xvci1ncmF5LTkwMClcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCIudGV4dC13aGl0ZVwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImNvbG9yXCIsXCJ2YWx1ZVwiOlwidmFyKC0tY29sb3Itd2hpdGUpXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiLmxvd2VyY2FzZVwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcInRleHQtdHJhbnNmb3JtXCIsXCJ2YWx1ZVwiOlwibG93ZXJjYXNlXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiQWN0aW9uQmFyXCJdLFwiZGVjbGFyYXRpb25zXCI6W3tcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiYmFja2dyb3VuZC1jb2xvclwiLFwidmFsdWVcIjpcIiM2NWFkZjFcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCJjb2xvclwiLFwidmFsdWVcIjpcIndoaXRlXCJ9XX0se1widHlwZVwiOlwicnVsZVwiLFwic2VsZWN0b3JzXCI6W1wiUGFnZVwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImJhY2tncm91bmRcIixcInZhbHVlXCI6XCJ3aGl0ZVwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcImNvbG9yXCIsXCJ2YWx1ZVwiOlwiYmxhY2tcIn1dfSx7XCJ0eXBlXCI6XCJydWxlXCIsXCJzZWxlY3RvcnNcIjpbXCIqXCIsXCI6OmJlZm9yZVwiLFwiOjphZnRlclwiLFwiOjpiYWNrZHJvcFwiXSxcImRlY2xhcmF0aW9uc1wiOlt7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tdHctcm90YXRlLXhcIixcInZhbHVlXCI6XCJpbml0aWFsXCJ9LHtcInR5cGVcIjpcImRlY2xhcmF0aW9uXCIsXCJwcm9wZXJ0eVwiOlwiLS10dy1yb3RhdGUteVwiLFwidmFsdWVcIjpcImluaXRpYWxcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCItLXR3LXJvdGF0ZS16XCIsXCJ2YWx1ZVwiOlwiaW5pdGlhbFwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tdHctc2tldy14XCIsXCJ2YWx1ZVwiOlwiaW5pdGlhbFwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tdHctc2tldy15XCIsXCJ2YWx1ZVwiOlwiaW5pdGlhbFwifSx7XCJ0eXBlXCI6XCJkZWNsYXJhdGlvblwiLFwicHJvcGVydHlcIjpcIi0tdHctYm9yZGVyLXN0eWxlXCIsXCJ2YWx1ZVwiOlwic29saWRcIn0se1widHlwZVwiOlwiZGVjbGFyYXRpb25cIixcInByb3BlcnR5XCI6XCItLXR3LWZvbnQtd2VpZ2h0XCIsXCJ2YWx1ZVwiOlwiaW5pdGlhbFwifV19XSxcInBhcnNpbmdFcnJvcnNcIjpbXX19XG5leHBvcnQgZGVmYXVsdCBfX19DU1MySlNPTl9MT0FERVJfRVhQT1JUX19fXG5jb25zdCB7IGFkZFRhZ2dlZEFkZGl0aW9uYWxDU1MgfSA9IHJlcXVpcmUoXCJAbmF0aXZlc2NyaXB0L2NvcmUvdWkvc3R5bGluZy9zdHlsZS1zY29wZVwiKTtcbmFkZFRhZ2dlZEFkZGl0aW9uYWxDU1MoX19fQ1NTMkpTT05fTE9BREVSX0VYUE9SVF9fXywgXCIvdmFyL3d3dy9wcm9qZWN0cy9vZmZsaW5lLWFwcHMvc3JjL2FwcC5jc3NcIilcbmlmKG1vZHVsZS5ob3QpIHtcblx0bW9kdWxlLmhvdC5hY2NlcHQoKVxuXHRtb2R1bGUuaG90LmRpc3Bvc2UoKCkgPT4ge1xuXHRcdGNvbnN0IHsgcmVtb3ZlVGFnZ2VkQWRkaXRpb25hbENTUyB9ID0gcmVxdWlyZShcIkBuYXRpdmVzY3JpcHQvY29yZS91aS9zdHlsaW5nL3N0eWxlLXNjb3BlXCIpO1xuXHRcdHJlbW92ZVRhZ2dlZEFkZGl0aW9uYWxDU1MoXCIvdmFyL3d3dy9wcm9qZWN0cy9vZmZsaW5lLWFwcHMvc3JjL2FwcC5jc3NcIilcblx0fSlcbn0iLCJpbXBvcnQgeyBkZWZpbmVDb21wb25lbnQgYXMgX2RlZmluZUNvbXBvbmVudCB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IHJlZiwgJG5hdmlnYXRlQmFjayB9IGZyb20gJ25hdGl2ZXNjcmlwdC12dWUnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IC8qQF9fUFVSRV9fKi9fZGVmaW5lQ29tcG9uZW50KHtcbiAgX19uYW1lOiAnRGV0YWlscycsXG4gIHNldHVwKF9fcHJvcHMsIHsgZXhwb3NlOiBfX2V4cG9zZSB9KSB7XG4gIF9fZXhwb3NlKCk7XG5cbmNvbnN0IGl0ZW1zID0gcmVmKFxuICBBcnJheSgxMDAwKVxuICAgIC5maWxsKDApXG4gICAgLm1hcCgoXywgaW5kZXgpID0+IGBJdGVtICR7aW5kZXggKyAxfWApLFxuKTtcblxuY29uc3QgX19yZXR1cm5lZF9fID0geyBpdGVtcywgZ2V0ICRuYXZpZ2F0ZUJhY2soKSB7IHJldHVybiAkbmF2aWdhdGVCYWNrIH0gfVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KF9fcmV0dXJuZWRfXywgJ19faXNTY3JpcHRTZXR1cCcsIHsgZW51bWVyYWJsZTogZmFsc2UsIHZhbHVlOiB0cnVlIH0pXG5yZXR1cm4gX19yZXR1cm5lZF9fXG59XG5cbn0pIiwiPHNjcmlwdCBsYW5nPVwidHNcIiBzZXR1cD5cbmltcG9ydCB7IHJlZiwgJG5hdmlnYXRlQmFjayB9IGZyb20gJ25hdGl2ZXNjcmlwdC12dWUnO1xuXG5jb25zdCBpdGVtcyA9IHJlZihcbiAgQXJyYXkoMTAwMClcbiAgICAuZmlsbCgwKVxuICAgIC5tYXAoKF8sIGluZGV4KSA9PiBgSXRlbSAke2luZGV4ICsgMX1gKSxcbik7XG48L3NjcmlwdD5cblxuPHRlbXBsYXRlPlxuICA8UGFnZSBhY3Rpb25CYXJIaWRkZW49XCJ0cnVlXCI+XG4gICAgPEdyaWRMYXlvdXQgcm93cz1cImF1dG8sICpcIj5cbiAgICAgIDxMYWJlbFxuICAgICAgICB0ZXh0PVwiR28gQmFja1wiXG4gICAgICAgIEB0YXA9XCIkbmF2aWdhdGVCYWNrXCJcbiAgICAgICAgY2xhc3M9XCJ0ZXh0LWNlbnRlciBweC00IHB5LTEwIHRleHQtMnhsIHRleHQtZ3JheS05MDAgZm9udC1ib2xkXCJcbiAgICAgIC8+XG5cbiAgICAgIDxDb250ZW50VmlldyByb3c9XCIxXCIgY2xhc3M9XCJiZy1bIzY1YWRmMV0gcm91bmRlZC10LTN4bFwiPlxuICAgICAgICA8TGlzdFZpZXdcbiAgICAgICAgICA6aXRlbXM9XCJpdGVtc1wiXG4gICAgICAgICAgc2VwYXJhdG9yQ29sb3I9XCJ0cmFuc3BhcmVudFwiXG4gICAgICAgICAgY2xhc3M9XCJiZy10cmFuc3BhcmVudFwiXG4gICAgICAgID5cbiAgICAgICAgICA8dGVtcGxhdGUgI2RlZmF1bHQ9XCJ7IGl0ZW0gfVwiPlxuICAgICAgICAgICAgPEdyaWRMYXlvdXQgY29sdW1ucz1cIiosIGF1dG9cIiBjbGFzcz1cInB4LTRcIj5cbiAgICAgICAgICAgICAgPExhYmVsIDp0ZXh0PVwiaXRlbVwiIGNsYXNzPVwidGV4dC0zeGwgcHktMyB0ZXh0LXdoaXRlXCIgLz5cbiAgICAgICAgICAgICAgPENvbnRlbnRWaWV3IGNvbD1cIjFcIiBjbGFzcz1cInctNSBoLTUgcm91bmRlZC1mdWxsIGJnLXdoaXRlXCIgLz5cbiAgICAgICAgICAgIDwvR3JpZExheW91dD5cbiAgICAgICAgICA8L3RlbXBsYXRlPlxuICAgICAgICA8L0xpc3RWaWV3PlxuICAgICAgPC9Db250ZW50Vmlldz5cbiAgICA8L0dyaWRMYXlvdXQ+XG4gIDwvUGFnZT5cbjwvdGVtcGxhdGU+XG4iLCJpbXBvcnQgeyBkZWZpbmVDb21wb25lbnQgYXMgX2RlZmluZUNvbXBvbmVudCB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7XG4gIHJlZixcbiAgY29tcHV0ZWQsXG4gIG9uTW91bnRlZCxcbiAgb25Vbm1vdW50ZWQsXG4gICRuYXZpZ2F0ZVRvLFxufSBmcm9tICduYXRpdmVzY3JpcHQtdnVlJztcbmltcG9ydCBEZXRhaWxzIGZyb20gJy4vRGV0YWlscy52dWUnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IC8qQF9fUFVSRV9fKi9fZGVmaW5lQ29tcG9uZW50KHtcbiAgX19uYW1lOiAnSG9tZScsXG4gIHNldHVwKF9fcHJvcHMsIHsgZXhwb3NlOiBfX2V4cG9zZSB9KSB7XG4gIF9fZXhwb3NlKCk7XG5cbmNvbnN0IGNvdW50ZXIgPSByZWYoMCk7XG5jb25zdCBtZXNzYWdlID0gY29tcHV0ZWQoKCkgPT4ge1xuICByZXR1cm4gYEJsYW5rIHtOfS1WdWUgYXBwOiAke2NvdW50ZXIudmFsdWV9YDtcbn0pO1xuXG5mdW5jdGlvbiBsb2dNZXNzYWdlKCkge1xuICBjb25zb2xlLmxvZygnWW91IGhhdmUgdGFwcGVkIHRoZSBtZXNzYWdlIScpO1xufVxuXG5sZXQgaW50ZXJ2YWw6IGFueTtcbm9uTW91bnRlZCgoKSA9PiB7XG4gIGNvbnNvbGUubG9nKCdtb3VudGVkJyk7XG4gIGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4gY291bnRlci52YWx1ZSsrLCAxMDApO1xufSk7XG5cbm9uVW5tb3VudGVkKCgpID0+IHtcbiAgY29uc29sZS5sb2coJ3VubW91bnRlZCcpO1xuICBjbGVhckludGVydmFsKGludGVydmFsKTtcbn0pO1xuXG5jb25zdCBfX3JldHVybmVkX18gPSB7IGNvdW50ZXIsIG1lc3NhZ2UsIGxvZ01lc3NhZ2UsIGdldCBpbnRlcnZhbCgpIHsgcmV0dXJuIGludGVydmFsIH0sIHNldCBpbnRlcnZhbCh2KSB7IGludGVydmFsID0gdiB9LCBnZXQgJG5hdmlnYXRlVG8oKSB7IHJldHVybiAkbmF2aWdhdGVUbyB9LCBEZXRhaWxzIH1cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShfX3JldHVybmVkX18sICdfX2lzU2NyaXB0U2V0dXAnLCB7IGVudW1lcmFibGU6IGZhbHNlLCB2YWx1ZTogdHJ1ZSB9KVxucmV0dXJuIF9fcmV0dXJuZWRfX1xufVxuXG59KSIsIjxzY3JpcHQgbGFuZz1cInRzXCIgc2V0dXA+XG5pbXBvcnQge1xuICByZWYsXG4gIGNvbXB1dGVkLFxuICBvbk1vdW50ZWQsXG4gIG9uVW5tb3VudGVkLFxuICAkbmF2aWdhdGVUbyxcbn0gZnJvbSAnbmF0aXZlc2NyaXB0LXZ1ZSc7XG5pbXBvcnQgRGV0YWlscyBmcm9tICcuL0RldGFpbHMudnVlJztcblxuY29uc3QgY291bnRlciA9IHJlZigwKTtcbmNvbnN0IG1lc3NhZ2UgPSBjb21wdXRlZCgoKSA9PiB7XG4gIHJldHVybiBgQmxhbmsge059LVZ1ZSBhcHA6ICR7Y291bnRlci52YWx1ZX1gO1xufSk7XG5cbmZ1bmN0aW9uIGxvZ01lc3NhZ2UoKSB7XG4gIGNvbnNvbGUubG9nKCdZb3UgaGF2ZSB0YXBwZWQgdGhlIG1lc3NhZ2UhJyk7XG59XG5cbmxldCBpbnRlcnZhbDogYW55O1xub25Nb3VudGVkKCgpID0+IHtcbiAgY29uc29sZS5sb2coJ21vdW50ZWQnKTtcbiAgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiBjb3VudGVyLnZhbHVlKyssIDEwMCk7XG59KTtcblxub25Vbm1vdW50ZWQoKCkgPT4ge1xuICBjb25zb2xlLmxvZygndW5tb3VudGVkJyk7XG4gIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xufSk7XG48L3NjcmlwdD5cblxuPHRlbXBsYXRlPlxuICA8RnJhbWU+XG4gICAgPFBhZ2U+XG4gICAgICA8QWN0aW9uQmFyPlxuICAgICAgICA8TGFiZWwgdGV4dD1cIkhvbWVcIiBjbGFzcz1cImZvbnQtYm9sZCB0ZXh0LWxnXCIgLz5cbiAgICAgIDwvQWN0aW9uQmFyPlxuXG4gICAgICA8R3JpZExheW91dCByb3dzPVwiKiwgYXV0bywgYXV0bywgKlwiIGNsYXNzPVwicHgtNFwiPlxuICAgICAgICA8TGFiZWxcbiAgICAgICAgICByb3c9XCIxXCJcbiAgICAgICAgICBjbGFzcz1cInRleHQteGwgYWxpZ24tbWlkZGxlIHRleHQtY2VudGVyIHRleHQtZ3JheS01MDBcIlxuICAgICAgICAgIDp0ZXh0PVwibWVzc2FnZVwiXG4gICAgICAgICAgQHRhcD1cImxvZ01lc3NhZ2VcIlxuICAgICAgICAvPlxuXG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICByb3c9XCIyXCJcbiAgICAgICAgICBAdGFwPVwiJG5hdmlnYXRlVG8oRGV0YWlscylcIlxuICAgICAgICAgIGNsYXNzPVwibXQtNCBweC00IHB5LTIgYmctd2hpdGUgYm9yZGVyLTIgYm9yZGVyLWJsdWUtNDAwIHJvdW5kZWQtbGdcIlxuICAgICAgICAgIGhvcml6b250YWxBbGlnbm1lbnQ9XCJjZW50ZXJcIlxuICAgICAgICA+XG4gICAgICAgICAgVmlldyBEZXRhaWxzXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9HcmlkTGF5b3V0PlxuICAgIDwvUGFnZT5cbiAgPC9GcmFtZT5cbjwvdGVtcGxhdGU+XG5cbjxzdHlsZT5cbi8qIC5pbmZvIHtcbiAgICBmb250LXNpemU6IDIwO1xuICB9ICovXG48L3N0eWxlPlxuIiwiaW1wb3J0IHsgcmVzb2x2ZUNvbXBvbmVudCBhcyBfcmVzb2x2ZUNvbXBvbmVudCwgY3JlYXRlVk5vZGUgYXMgX2NyZWF0ZVZOb2RlLCB3aXRoQ3R4IGFzIF93aXRoQ3R4LCBvcGVuQmxvY2sgYXMgX29wZW5CbG9jaywgY3JlYXRlQmxvY2sgYXMgX2NyZWF0ZUJsb2NrIH0gZnJvbSBcInZ1ZVwiXG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoX2N0eDogYW55LF9jYWNoZTogYW55LCRwcm9wczogYW55LCRzZXR1cDogYW55LCRkYXRhOiBhbnksJG9wdGlvbnM6IGFueSkge1xuICBjb25zdCBfY29tcG9uZW50X0xhYmVsID0gX3Jlc29sdmVDb21wb25lbnQoXCJMYWJlbFwiKSFcbiAgY29uc3QgX2NvbXBvbmVudF9Db250ZW50VmlldyA9IF9yZXNvbHZlQ29tcG9uZW50KFwiQ29udGVudFZpZXdcIikhXG4gIGNvbnN0IF9jb21wb25lbnRfR3JpZExheW91dCA9IF9yZXNvbHZlQ29tcG9uZW50KFwiR3JpZExheW91dFwiKSFcbiAgY29uc3QgX2NvbXBvbmVudF9MaXN0VmlldyA9IF9yZXNvbHZlQ29tcG9uZW50KFwiTGlzdFZpZXdcIikhXG4gIGNvbnN0IF9jb21wb25lbnRfUGFnZSA9IF9yZXNvbHZlQ29tcG9uZW50KFwiUGFnZVwiKSFcblxuICByZXR1cm4gKF9vcGVuQmxvY2soKSwgX2NyZWF0ZUJsb2NrKF9jb21wb25lbnRfUGFnZSwgeyBhY3Rpb25CYXJIaWRkZW46IFwidHJ1ZVwiIH0sIHtcbiAgICBkZWZhdWx0OiBfd2l0aEN0eCgoKSA9PiBbXG4gICAgICBfY3JlYXRlVk5vZGUoX2NvbXBvbmVudF9HcmlkTGF5b3V0LCB7IHJvd3M6IFwiYXV0bywgKlwiIH0sIHtcbiAgICAgICAgZGVmYXVsdDogX3dpdGhDdHgoKCkgPT4gW1xuICAgICAgICAgIF9jcmVhdGVWTm9kZShfY29tcG9uZW50X0xhYmVsLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIkdvIEJhY2tcIixcbiAgICAgICAgICAgIG9uVGFwOiAkc2V0dXAuJG5hdmlnYXRlQmFjayxcbiAgICAgICAgICAgIGNsYXNzOiBcInRleHQtY2VudGVyIHB4LTQgcHktMTAgdGV4dC0yeGwgdGV4dC1ncmF5LTkwMCBmb250LWJvbGRcIlxuICAgICAgICAgIH0sIG51bGwsIDggLyogUFJPUFMgKi8sIFtcIm9uVGFwXCJdKSxcbiAgICAgICAgICBfY3JlYXRlVk5vZGUoX2NvbXBvbmVudF9Db250ZW50Vmlldywge1xuICAgICAgICAgICAgcm93OiBcIjFcIixcbiAgICAgICAgICAgIGNsYXNzOiBcImJnLVsjNjVhZGYxXSByb3VuZGVkLXQtM3hsXCJcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBkZWZhdWx0OiBfd2l0aEN0eCgoKSA9PiBbXG4gICAgICAgICAgICAgIF9jcmVhdGVWTm9kZShfY29tcG9uZW50X0xpc3RWaWV3LCB7XG4gICAgICAgICAgICAgICAgaXRlbXM6ICRzZXR1cC5pdGVtcyxcbiAgICAgICAgICAgICAgICBzZXBhcmF0b3JDb2xvcjogXCJ0cmFuc3BhcmVudFwiLFxuICAgICAgICAgICAgICAgIGNsYXNzOiBcImJnLXRyYW5zcGFyZW50XCJcbiAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IF93aXRoQ3R4KCh7IGl0ZW0gfSkgPT4gW1xuICAgICAgICAgICAgICAgICAgX2NyZWF0ZVZOb2RlKF9jb21wb25lbnRfR3JpZExheW91dCwge1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zOiBcIiosIGF1dG9cIixcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwicHgtNFwiXG4gICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IF93aXRoQ3R4KCgpID0+IFtcbiAgICAgICAgICAgICAgICAgICAgICBfY3JlYXRlVk5vZGUoX2NvbXBvbmVudF9MYWJlbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcInRleHQtM3hsIHB5LTMgdGV4dC13aGl0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgfSwgbnVsbCwgOCAvKiBQUk9QUyAqLywgW1widGV4dFwiXSksXG4gICAgICAgICAgICAgICAgICAgICAgX2NyZWF0ZVZOb2RlKF9jb21wb25lbnRfQ29udGVudFZpZXcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbDogXCIxXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJ3LTUgaC01IHJvdW5kZWQtZnVsbCBiZy13aGl0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF86IDIgLyogRFlOQU1JQyAqL1xuICAgICAgICAgICAgICAgICAgfSwgMTAyNCAvKiBEWU5BTUlDX1NMT1RTICovKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF86IDEgLyogU1RBQkxFICovXG4gICAgICAgICAgICAgIH0sIDggLyogUFJPUFMgKi8sIFtcIml0ZW1zXCJdKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBfOiAxIC8qIFNUQUJMRSAqL1xuICAgICAgICAgIH0pXG4gICAgICAgIF0pLFxuICAgICAgICBfOiAxIC8qIFNUQUJMRSAqL1xuICAgICAgfSlcbiAgICBdKSxcbiAgICBfOiAxIC8qIFNUQUJMRSAqL1xuICB9KSlcbn0iLCJpbXBvcnQgeyByZXNvbHZlQ29tcG9uZW50IGFzIF9yZXNvbHZlQ29tcG9uZW50LCBjcmVhdGVWTm9kZSBhcyBfY3JlYXRlVk5vZGUsIHdpdGhDdHggYXMgX3dpdGhDdHgsIGNyZWF0ZVRleHRWTm9kZSBhcyBfY3JlYXRlVGV4dFZOb2RlLCBvcGVuQmxvY2sgYXMgX29wZW5CbG9jaywgY3JlYXRlQmxvY2sgYXMgX2NyZWF0ZUJsb2NrIH0gZnJvbSBcInZ1ZVwiXG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoX2N0eDogYW55LF9jYWNoZTogYW55LCRwcm9wczogYW55LCRzZXR1cDogYW55LCRkYXRhOiBhbnksJG9wdGlvbnM6IGFueSkge1xuICBjb25zdCBfY29tcG9uZW50X0xhYmVsID0gX3Jlc29sdmVDb21wb25lbnQoXCJMYWJlbFwiKSFcbiAgY29uc3QgX2NvbXBvbmVudF9BY3Rpb25CYXIgPSBfcmVzb2x2ZUNvbXBvbmVudChcIkFjdGlvbkJhclwiKSFcbiAgY29uc3QgX2NvbXBvbmVudF9CdXR0b24gPSBfcmVzb2x2ZUNvbXBvbmVudChcIkJ1dHRvblwiKSFcbiAgY29uc3QgX2NvbXBvbmVudF9HcmlkTGF5b3V0ID0gX3Jlc29sdmVDb21wb25lbnQoXCJHcmlkTGF5b3V0XCIpIVxuICBjb25zdCBfY29tcG9uZW50X1BhZ2UgPSBfcmVzb2x2ZUNvbXBvbmVudChcIlBhZ2VcIikhXG4gIGNvbnN0IF9jb21wb25lbnRfRnJhbWUgPSBfcmVzb2x2ZUNvbXBvbmVudChcIkZyYW1lXCIpIVxuXG4gIHJldHVybiAoX29wZW5CbG9jaygpLCBfY3JlYXRlQmxvY2soX2NvbXBvbmVudF9GcmFtZSwgbnVsbCwge1xuICAgIGRlZmF1bHQ6IF93aXRoQ3R4KCgpID0+IFtcbiAgICAgIF9jcmVhdGVWTm9kZShfY29tcG9uZW50X1BhZ2UsIG51bGwsIHtcbiAgICAgICAgZGVmYXVsdDogX3dpdGhDdHgoKCkgPT4gW1xuICAgICAgICAgIF9jcmVhdGVWTm9kZShfY29tcG9uZW50X0FjdGlvbkJhciwgbnVsbCwge1xuICAgICAgICAgICAgZGVmYXVsdDogX3dpdGhDdHgoKCkgPT4gW1xuICAgICAgICAgICAgICBfY3JlYXRlVk5vZGUoX2NvbXBvbmVudF9MYWJlbCwge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwiSG9tZVwiLFxuICAgICAgICAgICAgICAgIGNsYXNzOiBcImZvbnQtYm9sZCB0ZXh0LWxnXCJcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXzogMSAvKiBTVEFCTEUgKi9cbiAgICAgICAgICB9KSxcbiAgICAgICAgICBfY3JlYXRlVk5vZGUoX2NvbXBvbmVudF9HcmlkTGF5b3V0LCB7XG4gICAgICAgICAgICByb3dzOiBcIiosIGF1dG8sIGF1dG8sICpcIixcbiAgICAgICAgICAgIGNsYXNzOiBcInB4LTRcIlxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IF93aXRoQ3R4KCgpID0+IFtcbiAgICAgICAgICAgICAgX2NyZWF0ZVZOb2RlKF9jb21wb25lbnRfTGFiZWwsIHtcbiAgICAgICAgICAgICAgICByb3c6IFwiMVwiLFxuICAgICAgICAgICAgICAgIGNsYXNzOiBcInRleHQteGwgYWxpZ24tbWlkZGxlIHRleHQtY2VudGVyIHRleHQtZ3JheS01MDBcIixcbiAgICAgICAgICAgICAgICB0ZXh0OiAkc2V0dXAubWVzc2FnZSxcbiAgICAgICAgICAgICAgICBvblRhcDogJHNldHVwLmxvZ01lc3NhZ2VcbiAgICAgICAgICAgICAgfSwgbnVsbCwgOCAvKiBQUk9QUyAqLywgW1widGV4dFwiXSksXG4gICAgICAgICAgICAgIF9jcmVhdGVWTm9kZShfY29tcG9uZW50X0J1dHRvbiwge1xuICAgICAgICAgICAgICAgIHJvdzogXCIyXCIsXG4gICAgICAgICAgICAgICAgb25UYXA6IF9jYWNoZVswXSB8fCAoX2NhY2hlWzBdID0gKCRldmVudDogYW55KSA9PiAoJHNldHVwLiRuYXZpZ2F0ZVRvKCRzZXR1cC5EZXRhaWxzKSkpLFxuICAgICAgICAgICAgICAgIGNsYXNzOiBcIm10LTQgcHgtNCBweS0yIGJnLXdoaXRlIGJvcmRlci0yIGJvcmRlci1ibHVlLTQwMCByb3VuZGVkLWxnXCIsXG4gICAgICAgICAgICAgICAgaG9yaXpvbnRhbEFsaWdubWVudDogXCJjZW50ZXJcIlxuICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDogX3dpdGhDdHgoKCkgPT4gWy4uLihfY2FjaGVbMV0gfHwgKF9jYWNoZVsxXSA9IFtcbiAgICAgICAgICAgICAgICAgIF9jcmVhdGVUZXh0Vk5vZGUoXCIgVmlldyBEZXRhaWxzIFwiLCAtMSAvKiBDQUNIRUQgKi8pXG4gICAgICAgICAgICAgICAgXSkpXSksXG4gICAgICAgICAgICAgICAgXzogMSAvKiBTVEFCTEUgKi9cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXzogMSAvKiBTVEFCTEUgKi9cbiAgICAgICAgICB9KVxuICAgICAgICBdKSxcbiAgICAgICAgXzogMSAvKiBTVEFCTEUgKi9cbiAgICAgIH0pXG4gICAgXSksXG4gICAgXzogMSAvKiBTVEFCTEUgKi9cbiAgfSkpXG59IiwiaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSBcIi4vRGV0YWlscy52dWU/dnVlJnR5cGU9dGVtcGxhdGUmaWQ9MWNiNzMzNDImdHM9dHJ1ZVwiXG5pbXBvcnQgc2NyaXB0IGZyb20gXCIuL0RldGFpbHMudnVlP3Z1ZSZ0eXBlPXNjcmlwdCZsYW5nPXRzJnNldHVwPXRydWVcIlxuZXhwb3J0ICogZnJvbSBcIi4vRGV0YWlscy52dWU/dnVlJnR5cGU9c2NyaXB0Jmxhbmc9dHMmc2V0dXA9dHJ1ZVwiXG5cbmltcG9ydCBleHBvcnRDb21wb25lbnQgZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2Rpc3QvZXhwb3J0SGVscGVyLmpzXCJcbmNvbnN0IF9fZXhwb3J0c19fID0gLyojX19QVVJFX18qL2V4cG9ydENvbXBvbmVudChzY3JpcHQsIFtbJ3JlbmRlcicscmVuZGVyXSxbJ19fZmlsZScsXCJzcmMvY29tcG9uZW50cy9EZXRhaWxzLnZ1ZVwiXV0pXG4vKiBob3QgcmVsb2FkICovXG5pZiAobW9kdWxlLmhvdCkge1xuICBfX2V4cG9ydHNfXy5fX2htcklkID0gXCIxY2I3MzM0MlwiXG4gIGNvbnN0IGFwaSA9IF9fVlVFX0hNUl9SVU5USU1FX19cbiAgbW9kdWxlLmhvdC5hY2NlcHQoKVxuICBpZiAoIWFwaS5jcmVhdGVSZWNvcmQoJzFjYjczMzQyJywgX19leHBvcnRzX18pKSB7XG4gICAgYXBpLnJlbG9hZCgnMWNiNzMzNDInLCBfX2V4cG9ydHNfXylcbiAgfVxuICBcbiAgbW9kdWxlLmhvdC5hY2NlcHQoXCIuL0RldGFpbHMudnVlP3Z1ZSZ0eXBlPXRlbXBsYXRlJmlkPTFjYjczMzQyJnRzPXRydWVcIiwgKCkgPT4ge1xuICAgIGFwaS5yZXJlbmRlcignMWNiNzMzNDInLCByZW5kZXIpXG4gIH0pXG5cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBfX2V4cG9ydHNfXyIsImltcG9ydCB7IHJlbmRlciB9IGZyb20gXCIuL0hvbWUudnVlP3Z1ZSZ0eXBlPXRlbXBsYXRlJmlkPThkYzdjY2UyJnRzPXRydWVcIlxuaW1wb3J0IHNjcmlwdCBmcm9tIFwiLi9Ib21lLnZ1ZT92dWUmdHlwZT1zY3JpcHQmbGFuZz10cyZzZXR1cD10cnVlXCJcbmV4cG9ydCAqIGZyb20gXCIuL0hvbWUudnVlP3Z1ZSZ0eXBlPXNjcmlwdCZsYW5nPXRzJnNldHVwPXRydWVcIlxuXG5pbXBvcnQgXCIuL0hvbWUudnVlP3Z1ZSZ0eXBlPXN0eWxlJmluZGV4PTAmaWQ9OGRjN2NjZTImbGFuZz1jc3NcIlxuXG5pbXBvcnQgZXhwb3J0Q29tcG9uZW50IGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9kaXN0L2V4cG9ydEhlbHBlci5qc1wiXG5jb25zdCBfX2V4cG9ydHNfXyA9IC8qI19fUFVSRV9fKi9leHBvcnRDb21wb25lbnQoc2NyaXB0LCBbWydyZW5kZXInLHJlbmRlcl0sWydfX2ZpbGUnLFwic3JjL2NvbXBvbmVudHMvSG9tZS52dWVcIl1dKVxuLyogaG90IHJlbG9hZCAqL1xuaWYgKG1vZHVsZS5ob3QpIHtcbiAgX19leHBvcnRzX18uX19obXJJZCA9IFwiOGRjN2NjZTJcIlxuICBjb25zdCBhcGkgPSBfX1ZVRV9ITVJfUlVOVElNRV9fXG4gIG1vZHVsZS5ob3QuYWNjZXB0KClcbiAgaWYgKCFhcGkuY3JlYXRlUmVjb3JkKCc4ZGM3Y2NlMicsIF9fZXhwb3J0c19fKSkge1xuICAgIGFwaS5yZWxvYWQoJzhkYzdjY2UyJywgX19leHBvcnRzX18pXG4gIH1cbiAgXG4gIG1vZHVsZS5ob3QuYWNjZXB0KFwiLi9Ib21lLnZ1ZT92dWUmdHlwZT10ZW1wbGF0ZSZpZD04ZGM3Y2NlMiZ0cz10cnVlXCIsICgpID0+IHtcbiAgICBhcGkucmVyZW5kZXIoJzhkYzdjY2UyJywgcmVuZGVyKVxuICB9KVxuXG59XG5cblxuZXhwb3J0IGRlZmF1bHQgX19leHBvcnRzX18iLCJleHBvcnQgeyBkZWZhdWx0IH0gZnJvbSBcIi0hLi4vLi4vbm9kZV9tb2R1bGVzL0BuYXRpdmVzY3JpcHQvd2VicGFjay9kaXN0L2xvYWRlcnMvYXBwbHktY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvQG5hdGl2ZXNjcmlwdC93ZWJwYWNrL2Rpc3QvbG9hZGVycy9jc3MyanNvbi1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvZGlzdC9zdHlsZVBvc3RMb2FkZXIuanMhLi4vLi4vbm9kZV9tb2R1bGVzL3Bvc3Rjc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9jbG9uZWRSdWxlU2V0LTcudXNlWzNdIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2Rpc3QvaW5kZXguanM/P3J1bGVTZXRbMF0udXNlWzBdIS4vSG9tZS52dWU/dnVlJnR5cGU9c3R5bGUmaW5kZXg9MCZpZD04ZGM3Y2NlMiZsYW5nPWNzc1wiOyBleHBvcnQgKiBmcm9tIFwiLSEuLi8uLi9ub2RlX21vZHVsZXMvQG5hdGl2ZXNjcmlwdC93ZWJwYWNrL2Rpc3QvbG9hZGVycy9hcHBseS1jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9AbmF0aXZlc2NyaXB0L3dlYnBhY2svZGlzdC9sb2FkZXJzL2NzczJqc29uLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9kaXN0L3N0eWxlUG9zdExvYWRlci5qcyEuLi8uLi9ub2RlX21vZHVsZXMvcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanM/P2Nsb25lZFJ1bGVTZXQtNy51c2VbM10hLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvZGlzdC9pbmRleC5qcz8/cnVsZVNldFswXS51c2VbMF0hLi9Ib21lLnZ1ZT92dWUmdHlwZT1zdHlsZSZpbmRleD0wJmlkPThkYzdjY2UyJmxhbmc9Y3NzXCIiLCJleHBvcnQgeyBkZWZhdWx0IH0gZnJvbSBcIi0hLi4vLi4vbm9kZV9tb2R1bGVzL0BuYXRpdmVzY3JpcHQvd2VicGFjay9kaXN0L2xvYWRlcnMvbmF0aXZlc2NyaXB0LXdvcmtlci1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL3RzLWxvYWRlci9pbmRleC5qcz8/Y2xvbmVkUnVsZVNldC00LnVzZVswXSEuLi8uLi9ub2RlX21vZHVsZXMvQG5hdGl2ZXNjcmlwdC93ZWJwYWNrL2Rpc3QvbG9hZGVycy9uYXRpdmUtY2xhc3MtZG93bmxldmVsLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvQG5hdGl2ZXNjcmlwdC93ZWJwYWNrL2Rpc3QvbG9hZGVycy9uYXRpdmUtY2xhc3Mtc3RyaXAtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2Rpc3QvaW5kZXguanM/P3J1bGVTZXRbMF0udXNlWzBdIS4vRGV0YWlscy52dWU/dnVlJnR5cGU9c2NyaXB0Jmxhbmc9dHMmc2V0dXA9dHJ1ZVwiOyBleHBvcnQgKiBmcm9tIFwiLSEuLi8uLi9ub2RlX21vZHVsZXMvQG5hdGl2ZXNjcmlwdC93ZWJwYWNrL2Rpc3QvbG9hZGVycy9uYXRpdmVzY3JpcHQtd29ya2VyLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvdHMtbG9hZGVyL2luZGV4LmpzPz9jbG9uZWRSdWxlU2V0LTQudXNlWzBdIS4uLy4uL25vZGVfbW9kdWxlcy9AbmF0aXZlc2NyaXB0L3dlYnBhY2svZGlzdC9sb2FkZXJzL25hdGl2ZS1jbGFzcy1kb3dubGV2ZWwtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9AbmF0aXZlc2NyaXB0L3dlYnBhY2svZGlzdC9sb2FkZXJzL25hdGl2ZS1jbGFzcy1zdHJpcC1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvZGlzdC9pbmRleC5qcz8/cnVsZVNldFswXS51c2VbMF0hLi9EZXRhaWxzLnZ1ZT92dWUmdHlwZT1zY3JpcHQmbGFuZz10cyZzZXR1cD10cnVlXCIiLCJleHBvcnQgeyBkZWZhdWx0IH0gZnJvbSBcIi0hLi4vLi4vbm9kZV9tb2R1bGVzL0BuYXRpdmVzY3JpcHQvd2VicGFjay9kaXN0L2xvYWRlcnMvbmF0aXZlc2NyaXB0LXdvcmtlci1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL3RzLWxvYWRlci9pbmRleC5qcz8/Y2xvbmVkUnVsZVNldC00LnVzZVswXSEuLi8uLi9ub2RlX21vZHVsZXMvQG5hdGl2ZXNjcmlwdC93ZWJwYWNrL2Rpc3QvbG9hZGVycy9uYXRpdmUtY2xhc3MtZG93bmxldmVsLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvQG5hdGl2ZXNjcmlwdC93ZWJwYWNrL2Rpc3QvbG9hZGVycy9uYXRpdmUtY2xhc3Mtc3RyaXAtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2Rpc3QvaW5kZXguanM/P3J1bGVTZXRbMF0udXNlWzBdIS4vSG9tZS52dWU/dnVlJnR5cGU9c2NyaXB0Jmxhbmc9dHMmc2V0dXA9dHJ1ZVwiOyBleHBvcnQgKiBmcm9tIFwiLSEuLi8uLi9ub2RlX21vZHVsZXMvQG5hdGl2ZXNjcmlwdC93ZWJwYWNrL2Rpc3QvbG9hZGVycy9uYXRpdmVzY3JpcHQtd29ya2VyLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvdHMtbG9hZGVyL2luZGV4LmpzPz9jbG9uZWRSdWxlU2V0LTQudXNlWzBdIS4uLy4uL25vZGVfbW9kdWxlcy9AbmF0aXZlc2NyaXB0L3dlYnBhY2svZGlzdC9sb2FkZXJzL25hdGl2ZS1jbGFzcy1kb3dubGV2ZWwtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9AbmF0aXZlc2NyaXB0L3dlYnBhY2svZGlzdC9sb2FkZXJzL25hdGl2ZS1jbGFzcy1zdHJpcC1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvZGlzdC9pbmRleC5qcz8/cnVsZVNldFswXS51c2VbMF0hLi9Ib21lLnZ1ZT92dWUmdHlwZT1zY3JpcHQmbGFuZz10cyZzZXR1cD10cnVlXCIiLCJleHBvcnQgKiBmcm9tIFwiLSEuLi8uLi9ub2RlX21vZHVsZXMvQG5hdGl2ZXNjcmlwdC93ZWJwYWNrL2Rpc3QvbG9hZGVycy9uYXRpdmVzY3JpcHQtd29ya2VyLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvdHMtbG9hZGVyL2luZGV4LmpzPz9jbG9uZWRSdWxlU2V0LTQudXNlWzBdIS4uLy4uL25vZGVfbW9kdWxlcy9AbmF0aXZlc2NyaXB0L3dlYnBhY2svZGlzdC9sb2FkZXJzL25hdGl2ZS1jbGFzcy1kb3dubGV2ZWwtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9AbmF0aXZlc2NyaXB0L3dlYnBhY2svZGlzdC9sb2FkZXJzL25hdGl2ZS1jbGFzcy1zdHJpcC1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvZGlzdC90ZW1wbGF0ZUxvYWRlci5qcz8/cnVsZVNldFsxXS5ydWxlc1s0XSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9kaXN0L2luZGV4LmpzPz9ydWxlU2V0WzBdLnVzZVswXSEuL0RldGFpbHMudnVlP3Z1ZSZ0eXBlPXRlbXBsYXRlJmlkPTFjYjczMzQyJnRzPXRydWVcIiIsImV4cG9ydCAqIGZyb20gXCItIS4uLy4uL25vZGVfbW9kdWxlcy9AbmF0aXZlc2NyaXB0L3dlYnBhY2svZGlzdC9sb2FkZXJzL25hdGl2ZXNjcmlwdC13b3JrZXItbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy90cy1sb2FkZXIvaW5kZXguanM/P2Nsb25lZFJ1bGVTZXQtNC51c2VbMF0hLi4vLi4vbm9kZV9tb2R1bGVzL0BuYXRpdmVzY3JpcHQvd2VicGFjay9kaXN0L2xvYWRlcnMvbmF0aXZlLWNsYXNzLWRvd25sZXZlbC1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL0BuYXRpdmVzY3JpcHQvd2VicGFjay9kaXN0L2xvYWRlcnMvbmF0aXZlLWNsYXNzLXN0cmlwLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9kaXN0L3RlbXBsYXRlTG9hZGVyLmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzRdIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2Rpc3QvaW5kZXguanM/P3J1bGVTZXRbMF0udXNlWzBdIS4vSG9tZS52dWU/dnVlJnR5cGU9dGVtcGxhdGUmaWQ9OGRjN2NjZTImdHM9dHJ1ZVwiIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwifi9wYWNrYWdlLmpzb25cIik7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
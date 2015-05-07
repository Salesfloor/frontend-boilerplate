(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["components/header/header.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<nav class=\"top-bar\" data-topbar role=\"navigation\">\n  <ul class=\"title-area\">\n    <li class=\"name\">\n      <h1><a href=\"#\">My Site</a></h1>\n    </li>\n    <!-- Remove the class \"menu-icon\" to get rid of menu icon. Take out \"Menu\" to just have icon alone -->\n    <li class=\"toggle-topbar menu-icon\"><a href=\"#\"><span>Menu</span></a></li>\n  </ul>\n\n  <section class=\"top-bar-section\">\n    <!-- Right Nav Section -->\n    <ul class=\"right\">\n      <li class=\"active\"><a href=\"#\">Right Button Active</a></li>\n      <li class=\"has-dropdown\">\n        <a href=\"#\">Right Button Dropdown</a>\n        <ul class=\"dropdown\">\n          <li><a href=\"#\">First link in dropdown</a></li>\n          <li class=\"active\"><a href=\"#\">Active link in dropdown</a></li>\n        </ul>\n      </li>\n    </ul>\n\n    <!-- Left Nav Section -->\n    <ul class=\"left\">\n      <li><a href=\"#\">Left Nav Button</a></li>\n    </ul>\n  </section>\n</nav>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["components/main/main.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div id=\"header\"></div>\n<div id=\"body\"></div>\n<div id=\"footer\"></div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();

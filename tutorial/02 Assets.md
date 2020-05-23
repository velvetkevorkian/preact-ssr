# Build a server-rendered Preact app from scratch, part II

[Last time out](https://kylemacquarrie.co.uk/blog/preact-ssr-tutorial), we built a basic server-rendered app using Preact and Express; in this tutorial, we'll take that concept further. This tutorial will cover improving our build process; we'll quickly switch from Rollup to Webpack, let the computer tell us when we do something wrong, add support for older browsers using Babel, and optimise our built files for caching. That should set us up nicely for part III, where we'll write some tests and add CSS and images.

## Table of contents

1. [Switch to Webpack](#switch-to-webpack)

## Switch to Webpack



2. Add eslint
3. Add a hook to the PreactApp component and fix the html call
4. Add a production check and minify. Add build + clean scripts.
5. Add dev-tools hook
6. Add public folder and serve static
7. Add basic babel setup with htm plugin
8. Add asset manifest and name hashing
9. Add legacy client build: module/nomodule
10. Reorganise components into subfolders
11. Add tests
12. Add CSS
13. Add CSS w/modules
14. Optimise CSS in prod
14. Add images in content and from CSS
15. Hot reloading?
1000. Add cool webpack dashboard

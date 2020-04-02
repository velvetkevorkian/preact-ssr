# Build a server-rendered Preact app from scratch

In this tutorial, we're going to build a simple server-rendered [Preact](https://preactjs.com/) app, with client-side hydration. We'll start by serving plain HTML with [Express](https://expressjs.com/), then build up some components using Preact and [HTM](https://github.com/developit/htm). After that, we'll add some interactivity by *hydrating* our components, matching up the server rendered HTML with what the client-side framework thinks it should be. Along the way we'll have some fun (?) with build tools like [Nodemon](https://nodemon.io/), [Rollup](https://rollupjs.org/guide/en/), and NPM scripts.

None of the individual parts of this are (relatively speaking) that complex, but there are a lot of moving parts here and it can be hard to find an example that puts them all together. This is an intermediate level tutorial though, so I won't be explaining much of the syntax or JavaScript language features. You'll need to be reasonably comfortable with the terminal, NPM and JavaScript basics.

## Why server rendered? Why Preact?

Basically, it's fast. Sending as much as you can via HTML means less work to do on the client to make it work; using a lightweight framework like Preact means you're sending less JavaScript on the wire, which translates to a faster user experience, especially on slower devices (i.e. most Android phones - start with [this article by Alex Russell](https://infrequently.org/2017/10/can-you-afford-it-real-world-web-performance-budgets/) if you want to delve into the numbers). For content-heavy sites, it's almost invariably better to get as much of your content onscreen in HTML as quickly as possible. A lot of JavaScript framework SSR approaches involve building a single-page app then hacking in server rendering, but we're going to start with plain HTML and try to progressively enhance it.

It's also a good exercise in seeing what's going on under the hood -- in my day job I work on a moderately complex [React/Next.js](https://nextjs.org/) application, and there's a lot of magic that goes on under the surface. Understanding what your tools are doing for you is always useful.

## Table of contents
1. [An express app that serves HTML](#an-express-app-that-serves-html)
2. [Setting up Nodemon and NPM scripts](#setting-up-nodemon-and-npm-scripts)
3. [Setting up Rollup](#setting-up-rollup)
4. [Using Preact to render to HTML](#using-preact-to-render-to-html)
5. [Components and Composition](#components-and-composition)
6. [Keeping hydrated](#keeping-hydrated)
7. [Making it interactive](#making-it-interactive)

## An Express app that serves HTML

Let's start with a minimum viable Express server. Create a new folder and switch into it, then initialise NPM - the default options are fine.

```
$ mkdir preact-ssr
$ cd preact-ssr
$ npm init
```

If you're using git for version control, you probably want to add the `node_modules` folder to your `.gitignore` file at this point.

Now we'll install some dependencies we need to get started.

```
$ npm install express compression
```

Strictly speaking we don't *need* compression, but one of reason we've picked Preact and server-rendering is to squeeze out as much performance as possible, so let's roll with the best practice here and save a few bytes at basically no cost to us.

Create a `src` folder, with a `server.js` file inside it.

```
$ mkdir src
$ touch src/server.js
```

Let's set up our basic app in `src/server.js` to serve some static HTML.
```
const express = require('express')
const compression = require('compression')

const app = express() // create the express app
app.use(compression()) // use gzip for all requests

// some basic html to show
const layout =`
  <!DOCTYPE html>
  <html>
    <body>
      <h1>Hello</h1>
    </body>
  </html>
`

app.get('/', (request, response) => { // listen for requests to the root path
  response.send(layout) // send the HTML string
})

app.listen(3000) // listen for requests on port 3000
```

Run the app:
```
$ node src/server.js
```
Then visit http://localhost:3000. All being well, you should see the HTML rendered out. Check out the [demo repo at this point](https://github.com/velvetkevorkian/preact-ssr/tree/554ca38b12b44d80ebb9b55e6c5a734fb4602cbe) if you need to check what it should look like.

There is a slight issue here. Try changing the text in the `<h1>` tag and refresh your page. You should see that it doesn't update until you kill your server (using ctrl + c in your terminal) and restart it. That will get annoying fast, so let's take the time now to fix our workflow.

## Setting up Nodemon and NPM scripts

Nodemon is a tool that listens for changes to specified files and restarts the Node process when it sees one. Let's add it as a development dependency.

```
$ npm install nodemon --save-dev
```

We'll add an NPM script so we don't have to remember the right incantation every time. You can do this all via the CLI if you like, In the `"scripts"` block of your `package.json`, let's add a new entry.

```
"scripts": {
  "nodemon": "nodemon --watch src/server.js src/server.js"
}
```
This translates roughly to "run `node src/server.js`, but also watch `src/server.js` and rerun the command whenever you see that file has changed".

You should now be able to start the app using `npm run nodemon`, change some text in the `<h1>` and refresh to see it in the browser immediately.
Your repo should look something like [the demo at this point](https://github.com/velvetkevorkian/preact-ssr/tree/cba6cfd70be46be97145fd3035d7ff2b73716d0a).

## Setting up Rollup

So far, we've been using Node's `require` syntax to load dependencies, but we're going to want to add packages that are designed to use ES6's `import`. Let's use a bundler to paper over the differences between them so we can avoid gazing too deeply into that particular abyss. Webpack is a popular bundler, but configuring it is baffling at the best of times, so we'll go with Rollup. We don't need much, just the ability to use both `require` and `import` as needed, on both the server and the client. How hard can it be, right?

First up, we'll install `rollup`, as well as the `node-resolve` plugin.
```
npm install --save-dev rollup @rollup/plugin-node-resolve
```
Next, let's tell Rollup to take our `src/server.js` file and compile it into `build/server.js`. Create a `rollup.config.js` file at the root of your project, like this. Note that we're exporting an array of config objects, as we'll be adding a client bundle soon. I'd also recommend adding the `build` folder to your `.gitignore` file, although it's not mandatory - some people prefer to check in the built files.
```
import resolve from '@rollup/plugin-node-resolve'

export default [
  {
    input: 'src/server.js', // take our source file
    output: {
      file: 'build/server.js', // compile it into this file
      format: 'cjs', // use the CommonJS format, which works with Node
    },
    plugins: [resolve()], // use the node-resolve plugin so dependencies get imported properly
  }
]

```
Add another script to the `package.json` for Rollup. This tells Rollup to use the config file we just create, and to watch for changes to imported files and recompile when it sees a change.

```
"rollup": "rollup --config --watch",
```

Update the Nodemon script to use the built file, so it will restart the server every time Rollup finishes compiling.

```
"nodemon": "nodemon --watch build/server.js build/server.js"
```

Now we have two NPM scripts, `rollup` and `nodemon`, that we want to run in the background. At first glance, you might want to try `$ npm run rollup && npm run nodemon`; that won't work though, as the `rollup` watcher never exits, so the `nodemon` script never starts. We need a way to run them in parallel. You could do this by hand, but fortunately, there's a package for doing it in a single script. Let's install it.

```
$ npm install --save-dev npm-run-all
```

Then we'll add a `start` script that uses it to call both of the scripts we prepared earlier, in parallel.

```
"start": "npm-run-all --parallel nodemon rollup"
```

There were quite a lot of moving parts in there. Again, compare against [the demo repo at this point](https://github.com/velvetkevorkian/preact-ssr/tree/b68f8bb75e2ff4ba003a771a9c6643ff8dcb625a) if something's not working.

If you have a look at your `build/server.js` file, it should look pretty much like `src/server.js`, but now we're all set up for importing ES6 modules, so let's do that.

## Using Preact to render to HTML

Time to install some more dependencies. We'll install Preact itself, the Preact server-side renderer, and htm, which lets us use JavaScript's tagged template strings to build up our components (you can also use JSX, but that requires an additional compile step in your build process). If you've used JSX with React or another framework before, you'll probably have to be careful your muscle memory doesn't take over here; the syntax isn't that complicated, but it feels more like EJS (or ERB, for the Rubyists) than JSX sometimes.

```
$ npm install preact preact-render-to-string htm
```

In your `src/server.js` file, import what we need at the top of the file.
```
import render from 'preact-render-to-string'
import { html } from 'htm/preact' // use the provided preact binding
```

Generate some markup and render it to a string using the functions we imported from `preact-render-to-string` and `htm`.
```
const body = render(html`<h1>Hello from Preact</h1>`)
```

Then interpolate that variable into our final HTML document.
```
const layout =`
  <!DOCTYPE html>
  <html>
    <body>
      ${body}
    </body>
  </html>
`
```

Refresh your browser and you should see the text from your `body` variable, except now we've rendered it using Preact before turning it into HTML. [Have a look at the repo at this point](https://github.com/velvetkevorkian/preact-ssr/commit/d775be9941d3d0574c33eedcff60697311159873) if not.

## Components and Composition

One of the reasons Preact, React and other JavaScript frameworks are popular is because they make it easy to create small, separate components, then compose those components together to create larger applications. Let's refactor our single `server.js` file into components. We'll then render the whole component tree on the server, before adding the client-side JavaScript to make it interactive.

Create a `src/components` folder, and add `List.js` and `App.js` files to it.

```
$ mkdir src/components
$ touch src/components/List.js
$ touch src/components/PreactApp.js
```

90% of web development is looping over lists of things, so in `src/components/List.js`, we'll create a component that takes an array of data and renders it in a `<ul>`.
```
import { html } from 'htm/preact'

const List = ({ data }) => { // takes a data prop
  return html`
    <ul>
     <!-- loop over data array -->
      ${data.map(i => html`
        <li> <!-- render out each item -->
          ${i}
        </li>
      `)}
    </ul>
  `
}

export default List
```

In `src/components/PreactApp.js`, we'll import `List.js` and pass it some data.
```
import { html } from 'htm/preact'
import List from './List'

const dataArray = ['Item one', 'Item two', 'Item three']

const PreactApp = () => {
  return html`
    <${List} data=${dataArray} />
  `
}

export default PreactApp
```

Then in `src/server.js`, we'll import `src/components/PreactApp.js` and render that to a string, instead of just writing it inline.
```
import PreactApp from './components/PreactApp'
...
const body = render(html`
  <h1>Hello from Preact</h1>
  <${PreactApp} />
`)
```

When you refresh, you should see the `<h1>`, followed by the list of data from our `PreactApp` and `List` components. Compare against [the repo at this point](https://github.com/velvetkevorkian/preact-ssr/commit/38b201508eadb9df76eeeeff5e26766c9c13d386) if required.

Next up, let's add some interactivity to our `List` component.

## Keeping hydrated

Hydration is the process of reconciling the server-rendered DOM structure with what our client-side app thinks should be happening. When a framework like Preact sets up an app, it works out what it thinks the DOM should look like and works out the most efficient set of changes to get it into that state, then adds things like event listeners to the right elements. When we use hydration, we're saying to Preact "Don't worry about working out what changes are required, the DOM's already in the right state. Just add your event listeners and carry on."

Before we can do that, we need to load some client-side JavaScript, as currently we're just sending HTML with no `<script>` tags in sight. We have to do a few things:

1. Create a source file for our client bundle
2. Configure Rollup to compile it into the right format for the browser
3. Configure Express to serve it as a static file
4. Add a `<script>` tag into the HTML Express is serving
5. Add some interactive elements into our app!

Start by creating the source file.
```
$ touch src/client.js
```

In `src/client.js`, import the `PreactApp` component, and tell Preact where in the DOM we want to consider as our app.

```
import { hydrate } from 'preact'
import PreactApp from './components/PreactApp'

hydrate(PreactApp(), document.getElementById('root'))
```

In `src/server.js`, add a `<div>` with a matching ID around the `PreactApp` component.

```
  <div id="root">
    <${PreactApp} />
  </div>
```

In `rollup.config.js`, add a second config object into the array. This has different settings from the `server.js` file, as the browser doesn't understand Node's CommonJS syntax natively.

```
import resolve from '@rollup/plugin-node-resolve'

export default [
  {
    input: 'src/server.js',
    output: {
      file: 'build/server.js',
      format: 'cjs',
    },
    plugins: [resolve()],
  },
  {
    input: 'src/client.js',
    output: {
      file: 'build/client.js',
      format: 'es',
      name: 'client',
    },
    plugins: [resolve()],
  },
]
```

Now when you run `npm start`, you should see a `client.js` popping into the `build` folder alongside `server.js`.

Next, let's tell Express how to serve our client bundle as a static file.

```
app.get('/client.js', (request, response) => {
  response.sendFile('client.js', {
    root: __dirname, // this will be the build folder
  })
})
```

Now you can visit http://localhost:3000/client.js and see some compiled JavaScript. Let's pop that in a script tag in `src/server.js`.

```
const layout =`
  <!DOCTYPE html>
  <html>
    <body>
      ${body}
      <script type="module" src="client.js" async></script>
    </body>
  </html>
`
```

Now when you refresh http://localhost:3000, you have a working, hydrated Preact application that does... precisely nothing (if you don't, [have a look at the example repo at this stage](https://github.com/velvetkevorkian/preact-ssr/commit/1f328b78aca795471af3b53c7426da9b3097101d)). Let's fix that.

## Making it interactive

All we need to do now is add some functionality into our `src/components/List.js` component. On the server it gets compiled to HTML, while our client bundle will look out for it and set up the required listeners when it hydrates. We'll add a button to each list item, another item to show how many times they were clicked, and we'll use Preact's `useState` hook to track that data.

```
import { html } from 'htm/preact'
import { useState } from 'preact/hooks'

const List = ({ data }) => { // takes a data prop
  // how many clicks have we counted? Default to 0
  const [count, setCount] = useState(0)

  // shared event handler
  const handleClick = () => {
    setCount(count + 1)
  }

  return html`
    <ul>
      ${data && data.map(i => html`
        <li>
          <!-- listen for button clicks -->
          ${i}: <button onClick=${handleClick}>Click me</button>
        </li>
      `)}
      <li>
        <!-- list how many clicks we've seen, with the right plural -->
        ${count} ${count === 1 ? 'click' : 'clicks'} counted
      </li>
    </ul>
  `
}

export default List
```

You should now have a functional Preact application that still does as much of its work up-front on the server as possible. Again, if you're having issues, try [comparing against the example repo](https://github.com/velvetkevorkian/preact-ssr/commit/172be9630f3c9c01933e8784bc84102e04c3b5c1). Hopefully that is a useful starting point -- there's still a lot of low-hanging fruit that we could build into this, but I'll save that for a future tutorial.

If you have feedback or suggestions, then hit me up [on Twitter](https://twitter.com/k_macquarrie) or [open an issue on the repo](https://github.com/velvetkevorkian/preact-ssr/issues).

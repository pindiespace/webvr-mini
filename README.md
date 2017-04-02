# ![webvr-mini](doc/image/logo.png)

### mini library offering basic webgl and webvr support

This library illustrates how to get a WebVR installation up in barebones code, without any frameworks or JavaScript libraries, relying directly on the WebGL and WebVR libraries.

The goal was to create an app that would allow experimentation in WebVR with simple worlds, without the overhead of a large library like THREE.js. In addition, it is written in ES6 instead of ES5.

## Building

The dev environment uses WebPack. Gulp might be a better choice, but errors can crash gulp silently so you continue to edit while your bundle is not updated. Since development with WebGL and WebVR causes a lot of crashes, using WebPack and the WebPack development server seemed a better choice.

```
npm install webpack -g
npm install webpack-dev-server -g
npm install
```

## Development

To run debugging, use the following npm command (in a separate window)

```
npm run dev
```

To minify and run production, excluding debugging libraries, type.

```
npm run build
```

## Starting the server

Start webpack watching in first console window:

```
"start": "webpack-dev-server --inline --devtool eval --progress --colors --content-base dist"
```

## Checking things in the console

To see auto-updates, access using the dev server URL. NOTE: this will only show 
internal console.logs. You can't see objects attached to the window from here, since we 
are running in an <iframe>.

http://localhost:8080/webpack-dev-server/

To see the site without auto-updates, and with objects attached to the window object visible in the Console (really needed for debugging without a lot of unit tests), use:

http://localhost:8080

## Note on environment variables

Environment variables are passed in at npm, and re-worked in webpack.

"build": "cross-env BUILD_RELEASE=true BUILD_DEV=false webpack --config webpack-production.config.js -p",
"dev": "cross-env BUILD_RELEASE=false BUILD_DEV=true webpack",

__DEV__ means we are in a development environment

__RELEASE__ means we are in a production environment

## Sources

Royalty-free 3d models for testing from [CG Trader](https://www.cgtrader.com)

[Ui icons from The Noun Project](https://thenounproject.com/) (see individual credits in source).

## References

[WebGL Fundamentals from TWGL](http://webglfundamentals.org/)

[TWGL Docs](http://twgljs.org/)

[Learning WebGL](http://learningwebgl.com/blog/?page_id=1217)

[Barebones WebGL Routines (e.g. the font-loader in ui.js)](https://github.com/williame/barebones.js/tree/gh-pages/barebones.js)

[Cinematic Camera Movement (three.js)](https://nathanselikoff.com/2552/code-sketches/basic-camera-movement-three-js-webgl)

[First-Person Camera](https://github.com/shama/first-person-camera)

[Building an OpenGL Game from Scratch](http://crongdor.com/2016/04/01/making-the-game-from-scratch/)

[Some WebGL Samples, including dynamic clouds](https://www.ibiblio.org/e-notes/webgl/webgl.htm)



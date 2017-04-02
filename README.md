# ![webvr-mini](doc/image/logo.png)

### mini library offering basic webgl and webvr support

This library illustrates how to get a WebVR installation up in barebones code, without any frameworks or JavaScript libraries, relying directly on the WebGL and WebVR libraries.

# Building

npm install webpack -g
npm install webpack-dev-server -g
npm install

## Development

To run debugging, use the following npm command (in a separate window)

```npm run dev```

To minify and run production, excluding debugging libraries, type.

```npm run build```

## Starting the server

Start webpack watching in first console window:

```"start": "webpack-dev-server --inline --devtool eval --progress --colors --content-base dist"```

## Checking things in the console

To see auto-updates, access using the dev server URL. NOTE: this will only show 
internal console.logs. You can't see objects attached to the window from here, since we 
are in an <iframe>.

http://localhost:8080/webpack-dev-server/

To see the site without auto-updates, and with GLOBAL windows object visible in the Console, use http://localhost:8080

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



# ![webvr-mini](doc/image/logo.png)

### mini library offering basic webgl and webvr support

## building

npm install webpack -g
npm install webpack-dev-server -g
npm install

##development
To run debugging, use the following npm command (in a separate window)

npm run dev

To minify and run production, excluding debugging libraries, type.

npm run build

#start the server
Start webpack watching in first console window
"start": "webpack-dev-server --inline --devtool eval --progress --colors --content-base dist"

#Checking things in the console

To see auto-updates, access using the dev server URL. NOTE: this will only show 
internal console.logs. You can't see objects attached to the window from here, since we 
are in an <iframe>.

http://localhost:8080/webpack-dev-server/

To see the site without auto-updates, and with GLOBAL windows object visible in the Console, use
http://localhost:8080

## note on environment variables
Environment variables are passed in at npm, and re-worked in webpack.

"build": "cross-env BUILD_RELEASE=true BUILD_DEV=false webpack --config webpack-production.config.js -p",
"dev": "cross-env BUILD_RELEASE=false BUILD_DEV=true webpack",

__DEV__ means we are in a development environment

__RELEASE__ means we are in a production environment

## Sources

Royalty-free 3d models for testing from:

https://www.cgtrader.com


## References

WebGL Fundamentals (from twgl)
@link http://webglfundamentals.org/

Learning WebGL
@link http://learningwebgl.com/blog/?page_id=1217

TWGL Docs
@link http://twgljs.org/

Barebones WebGL Routines (font-loader in ui.js)
https://github.com/williame/barebones.js/tree/gh-pages/barebones.js

Cinematic Camera Movement (three.js)
@link https://nathanselikoff.com/2552/code-sketches/basic-camera-movement-three-js-webgl

First-Person Camera
@link https://github.com/shama/first-person-camera

OpenGL Game from Scratch
@link http://crongdor.com/2016/04/01/making-the-game-from-scratch/

Some WebGL Samples (incd. dynamic clouds)
@link https://www.ibiblio.org/e-notes/webgl/webgl.htm



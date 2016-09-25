/*
 * app.es6
 * es6 entry point, transpiled (via BabelJS) to ES5.
 */

import Util from  './util';
import WebGL from './webgl';
import WebVR from './webvr';

// Import our es6 classes.

var util = new Util();

var webgl = new WebGL( {} );

var webvr = new WebVR( {} );

let checkName= (firstName, lastName) => {
 if(firstName !== 'nader' || lastName !== 'dabit') {
   console.log('You are not Nader Dabit');
 } else {
    console.log('You are Nader Dabit');
  }
}

checkName('nader', 'jackson');


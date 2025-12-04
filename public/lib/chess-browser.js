// Browser bundle for chess.js
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Chess = factory());
})(this, function () {
  'use strict';
  
  // Import the chess.js module
  const chessModule = require('chess.js');
  return chessModule.Chess;
});

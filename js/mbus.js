
define(function() {
    "use strict";

    function MessageBus() {

      this._mergeListeners = [];
      this._sourceRecordListeners = [];
      this._targetRecordListeners = [];
      
      this._mergeRedrawListeners = [];
      this._sourceRedrawListeners = [];
      
      this._hashChangeListeners = [];

    }

    MessageBus.prototype.addMergeListener = function(fn) {
      this._mergeListeners.push(fn);
    };
    MessageBus.prototype.addSourceChangeListener = function(fn) {

      this._sourceRecordListeners.push(fn);
    };
    MessageBus.prototype.addTargetChangeListener = function(fn) {

      this._targetRecordListeners.push(fn);
    };

    MessageBus.prototype.addMergeRedrawListener = function(fn) {
      this._mergeRedrawListeners.push(fn);
    };
    MessageBus.prototype.addSourceRedrawListener = function(fn) {
      this._sourceRedrawListeners.push(fn);
    };

    MessageBus.prototype.addHashListener = function(fn) {
      this._hashChangeListeners.push(fn);
    };


    MessageBus.prototype.notifyHashChange = function(from, to) {

      for (var i=0;i < this._hashChangeListeners.length;i++) {
        this._hashChangeListeners[i](from, to);
      }
    };

    MessageBus.prototype.notifyMergeSuccess = function() {

      for (var i=0;i < this._mergeListeners.length;i++) {
        this._mergeListeners[i]();
      }
    };

    MessageBus.prototype.notifySourceChange = function() {
      for (var i=0;i < this._sourceRecordListeners.length;i++) {
        this._sourceRecordListeners[i]();
      }
    };
    MessageBus.prototype.notifyTargetChange = function() {

      for (var i=0;i < this._targetRecordListeners.length;i++) {
        this._targetRecordListeners[i]();
      }
    };

    MessageBus.prototype.notifyMergeRedraw = function() {
      for (var i=0;i < this._mergeRedrawListeners.length;i++) {
        this._mergeRedrawListeners[i]();
      }
    };
    MessageBus.prototype.notifySourceRedraw = function() {
      
      for (var i=0;i < this._sourceRedrawListeners.length;i++) {
        this._sourceRedrawListeners[i].apply(this, arguments);
      }
    };

    return MessageBus;
});

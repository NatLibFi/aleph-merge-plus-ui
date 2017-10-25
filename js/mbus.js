/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* aleph-merge-plus-ui
*
* Copyright (C) 2015-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of aleph-merge-plus-ui
*
* aleph-merge-plus-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* aleph-merge-plus-ui is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

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

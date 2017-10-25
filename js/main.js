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
require.config({
   urlArgs: "bust=" + (new Date()).getTime(),
   
   baseUrl: 'js',
   paths: {
    
       'jquery': 'bower_components/jquery/jquery',
       'jquery.migrate': 'bower_components/jquery/jquery-migrate',
       'jquery.cookie': 'bower_components/jquery.cookie/jquery.cookie',
       'jquery.ui': 'bower_components/jquery.ui/dist/jquery-ui',
       'underscore': 'bower_components/underscore/underscore',
       'WorkingDialog': '../WorkingDialog/WorkingDialog',
       'jquery.contextMenu': '../contextMenu/jquery.contextMenu'
       
   },
   
   shim: {
       'jquery.cookie': {
           deps: ['jquery'],
           exports: '$.cookie'
       },
       'jquery.ui': {
           deps: ['jquery'],
           exports: '$.ui'
       },
       'WorkingDialog': {
           exports: 'WorkingDialog'
       },
       'jquery.contextMenu': {
           deps: ['jquery', 'jquery.migrate'],
           exports: '$.contextMenu'
       },
       'jquery.migrate': {
           deps: ['jquery']
       }
       
   }
   
});

require(['merge'], function(App) {
   
});

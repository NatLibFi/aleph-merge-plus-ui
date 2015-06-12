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

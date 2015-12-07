/*jshint sub:true*/

define(function() {
    
    var config = {

         X_SERVER: "https://utils.melinda.kansalliskirjasto.fi/X",
         MERGEAPI: "https://utils.melinda.kansalliskirjasto.fi/merge_ws/merge.pl",

        //X_SERVER: "https://utils.melinda.kansalliskirjasto.fi/merge_test/xstub/x_stub.pl",
        //MERGEAPI: "https://utils.melinda.kansalliskirjasto.fi/merge_ws/merge.pl",
        //UILOGGER: "http://localhost/merge_uusi/trunk/merge_ui/uilogger.pl?line=",

         UILOGGER: "https://utils.melinda.kansalliskirjasto.fi/merge/ui/uilogger.pl?line=",

     
        //Double DB API
        //DDB: "https://utils.melinda.kansalliskirjasto.fi/merge_test/xstub/x_stub.pl"
         DDB: "https://utils.melinda.kansalliskirjasto.fi/tuplatietokanta/db.pl"
    };

    config['XAPI'] = config['X_SERVER'] + "?op=find-doc&base=fin01&show_sub6=Y&doc_num=";
    config['XCHILDAPI'] = config['X_SERVER'] + "?op=find&base=fin01&request=MHOST=";
    config['XPOSTAPI'] = config['X_SERVER'];
    
    return config;
});




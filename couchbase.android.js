var CouchbaseLite = (function(){
  var manager;
  var database;

  var app = require("application");

  (function(){
    if (!manager) {
      try {
        var context = app.android.context;

        console.log("couchbase log");
        console.log(new com.couchbase.lite.android.AndroidContext(context));

        manager = new com.couchbase.lite.Manager(new com.couchbase.lite.android.AndroidContext(context), null);

      } catch(ex) {
        console.log(ex.message);
      }
    }
    try {
      database = manager.getDatabase('couchbase-lite');
    } catch (ex){
       console.log(ex.message);
    }
  })();

  function CouchbaseLite(){

  }

  CouchbaseLite.prototype.createDocument = function(data){
      var doc = database.createDocument();
      var docId = doc.getId();

      try {
          doc.putProperties(data);
      } catch (ex){
          console.log(ex.getMessage());
      }

      return docId;
   };

   CouchbaseLite.prototype.updateDocument = function(documentId, data){
      var document = database.getDocument(documentId);

      try{
        document.putProperties(data);

        console.log("Document updated");

      } catch (ex){
        console.log(ex.getMessage());
      }

   };

   CouchbaseLite.prototype.deleteDocument = function(documentId){
        var document = database.getDocument(documentId);

        try {
          document.delete();
        } catch (ex){
          console.log(ex.getMessage());
          return false;
        }
        return true;
   };

   CouchbaseLite.prototype.query = function(docName, key, limit){
        var view = database.getView(docName);

        view.setMapBlockVersion(function(doc, emit){
             emit(key, doc);
        }, "1");

        view.setMap(new com.couchbase.lite.Mapper({
           map: function (doc, emit) {
              emit(key, doc);
            }
        }));

        var query = view.createQuery();

        if (key){
            query.setStartKey(key);
        }

        if (limit){
           query.setLimit(limit);
        }

        var results = []

        try{
          var resultSet = query.run();

          var index = 0;

          while(resultSet.hasNext()){
            var row = resultSet.next();

            var value = row.getValue();

            results[index++] = value;
          }

        } catch (ex){
            console.log(ex.getMessage());
        }
        return results;
   };

   return CouchbaseLite;

})();

module.exports = CouchbaseLite;

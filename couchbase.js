var CouchbaseLite = (function(){
  var manager;
  var database;

  (function(){
    if (!manager) {
      manager = CBLManager.sharedInstance();
      if (!manager){
         console.log("Cannot create shared instance of CBLManager");
      }
    }

    var errorRef = new interop.Reference();

    database = manager.databaseNamedError('couchbase-lite', errorRef);

    if (!database){
       console.log(errorRef.value);
    }

  })();

  function CouchbaseLite(){

  }

  CouchbaseLite.prototype.createDocument = function(data){
      var doc = database.createDocument();

      var docId = doc.documentID;

      var errorRef = new interop.Reference();
      var revision  = doc.putPropertiesError(data, errorRef);

      if (revision){
          console.log("Document created and written to database");
      }

      return docId;
   };

   CouchbaseLite.prototype.updateDocument = function(documentId, data){
      var document = database.documentWithID(documentId);

      var properties = document.properties;

      for (var property in properties){
          if (data[property]){
            properties[property] = data[property];
          }
      }
      var errorRef = new interop.Reference();
      var revision  = doc.putPropertiesError(data, errorRef);

      if (revision){
          console.log("Document updated");
      }
   };

   CouchbaseLite.prototype.deleteDocument = function(documentId){
        var document = database.documentWithID(documentId);
        var errorRef = new interop.Reference();

        document.deleteDocument(errorRef);

        if (!errorRef){
            console.log(errorRef.value);
            return false;
        }
        return true;
   };

   CouchbaseLite.prototype.query = function(docName, key, limit){
        var view = database.viewNamed(docName);

        view.setMapBlockVersion(function(doc, emit){
             emit(key, doc);
        }, "1");

        var query = view.createQuery();

        if (key){
            query.startKey = key;
        }

        if (limit){
           query.limit = limit;
        }

        var errorRef = new interop.Reference();
        var resultSet = query.run(errorRef);

        var row = resultSet.nextRow();

        var results = []
        var index = 0;

        while(row){
          var data = NSJSONSerialization.dataWithJSONObjectOptionsError(row.value, NSJSONWritingPrettyPrinted, errorRef);
          var jsonString = NSString.alloc().initWithDataEncoding(data, NSUTF8StringEncoding);

          results[index++] = JSON.parse(jsonString);

          row = resultSet.nextRow();
        }

        if (!errorRef){
            console.log(errorRef.value);
        }

        return results;
   };

   return CouchbaseLite;

})();

module.exports = CouchbaseLite;

let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    // this will create a reference to the database
    const db = event.target.result;
    // this makes a table as onject store, that is set to have an auto icrement primary key
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// when request is successfull 
request.onsuccess = function (event) {
    // when db is successfully created with its object store (from onupgradedneeded event above), save reference to db in global variable
    db = event.target.result;
// check if app is online, if yes run checkDatabase() function to send all local db data to api
if (navigator.onLine) {
    uploadBudget();
  }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };
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

// this will run if a user attempts to submit when offline
  function saveRecord(record) {
    // this allows to start a new transaction the the permissions to read and write data
    const transaction = db.transaction(['new_budget'], 'readwrite');
  
    const budgetStore = transaction.objectStore('new_budget');
  
    // add record to your store with add method.
    budgetStore.add(record);
  }


  function uploadBudget() {
    // open a transaction on your pending db
    const transaction = db.transaction(['new_budget'], 'readwrite');
  
    // access your pending object store
    const budgetStore = transaction.objectStore('new_budget');

    // get all records from store and set it to a variable
    const getAll = budgetStore.getAll();


    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
          fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          })
            .then(response => response.json())
            .then(serverResponse => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }
    
              const transaction = db.transaction(['new_budget'], 'readwrite');
              const budgetStore = transaction.objectStore('new_budget');
              // clear all items in your store
              budgetStore.clear();
            })
            .catch(err => {
              // set reference to redirect back here
              console.log(err);
            });
        }
      };
    }


    function deletePending() {
        const transaction = db.transaction(["new_budget"], "readwrite");
        const budgetStore = transaction.objectStore("new_budget");
        budgetStore.clear();
      }

      // listen for app coming back online
window.addEventListener("online", uploadBudget);
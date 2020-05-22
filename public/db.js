let db; 

const request = indexedDB.open("budget", 2); 

request.onupgradeneeded = function(event) {
    const db = event.target.result; 
    db.createOjbectStore("pending", {autoIncrement: true})
}; 

request.onsuccess = function(event)  {
    db = event.target.result; 
    if (navigator.online){
        checkDatabase(); 
    }
}; 

request.onerror = function(event) {
    console.log("Oh no! " + event.target.errorCode)
}; 

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readWrite"); 
    const store = transaction.objectStore("pending"); 
    store.add(record); 
}; 

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readWrite"); 
    const transactions = transaction.objectStore("pending"); 
    const getAll = transactions.getAll(); 
    
    getAll.onsuccess = function(){
        if (getAll.result.length > 0){
            fetch("/api/transcation/bulk", {
                method: "POST", 
                body: JSON.stringify(getAll.result), 
                headers: {
                    Accept: "application/json, text/plain, */*", 
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readWrite")
                const transactions = transaction.objectStore("pending"); 

                transactions.clear(); 
            })
        }
    }; 
}

window.addEventListener("online", checkDatabase); 
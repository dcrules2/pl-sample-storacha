/* 
The index.js File will execute both components. 

First the store.js that will download:
    HTML 
    CSS 
    Cat Images (only)

Second the upload.js will take the downloaded files & upload to as a directory to web3.storage
*/

// Import functions
import store from '../src/app/store.js';
import upload from '../src/app/upload.js'

//Run functions
// Suggestion once store is asynchronous, you should await it before calling upload
store();
await upload()


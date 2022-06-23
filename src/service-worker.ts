/// <reference lib="WebWorker" />

import { Concordance } from "./Concordance";
import { compact } from "./data";

let index: Concordance;

async function loadDatabase() {
  index = new Concordance(compact as any[]);
}

self.addEventListener('install', function(event) {
  event.waitUntil(loadDatabase()); 
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim()); // Become available to all pages
});



self.addEventListener('message', function(event) {
  console.log('to process: ' + event.data);
  event.ports[0].postMessage(index.search(event.data));
})


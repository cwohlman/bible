import {manifest, version} from '@parcel/service-worker';
import {Concordance} from './Concordance';
import {bible} from './data';

let concordance: Concordance;

async function install() {
  // const cache = await caches.open(version);
  // await cache.addAll(manifest);

  concordance = new Concordance(bible);
}
addEventListener('install', e => e.waitUntil(install()));

async function activate() {
  // const keys = await caches.keys();
  // await Promise.all(
  //   keys.map(key => key !== version && caches.delete(key))
  // );

}
addEventListener('activate', e => e.waitUntil(activate()));

const cacheFirst = async (request) => {
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }
  return fetch(request);
};


self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TEST') {
    event.source?.postMessage({ type: "TEST" });
  }
});

// self.addEventListener('fetch', (event) => {
//   event.respondWith(cacheFirst(event.request));
// });

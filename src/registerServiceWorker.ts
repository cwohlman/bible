var worker = navigator.serviceWorker.register(
  new URL('serviceWorker.ts', import.meta.url),
  {type: 'module'}
);

//send message
async function test() {
  await navigator.serviceWorker.ready;

  navigator.serviceWorker.controller?.postMessage({
    type: 'TEST',
  });
  
  //listen to messages
  navigator.serviceWorker.onmessage = (event) => {
    if (event.data && event.data.type === 'TEST') {
      console.log(event.data);
    }
  };
}

test();

console.log('registered service worker');
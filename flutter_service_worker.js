'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "009c9e65172e010890f7f65fde438006",
"index.html": "ea47cf1a0920a162a3dca6033ee1eb34",
"/": "ea47cf1a0920a162a3dca6033ee1eb34",
"main.dart.js": "699d347d64cb91c7086f65282ecbdfdf",
"manifest.json": "c404a9d736ad77096bd84bdb2426dd77",
"assets/AssetManifest.json": "4f11dba8e77f373b7f37d53e3cf23258",
"assets/NOTICES": "63ed9c108f0b2f474c04f9d5626ffaae",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/assets/images/TS.png": "a195f0e168b593f8b31b316d12a81978",
"assets/assets/images/flutterIcon.png": "618037895b03acf73ad93729e2ddb6c7",
"assets/assets/images/NLP.png": "4109d92629f6831c3fb4f6ec6179fa80",
"assets/assets/images/bg2.jpeg": "2879accc54c1b22f91f97d7d650ae43f",
"assets/assets/images/cric.jpg": "9c0904849ca4759b2ec88a8806dc90a5",
"assets/assets/images/CODMenemyDetction.jpeg": "3d683c266b2244112b5f02d82dfa63ed",
"assets/assets/images/send_mail.png": "af24bc5136222b43a9d3ca86db787c84",
"assets/assets/images/github.png": "0ba2aa20e2c2ce80e9a2db5b07198464",
"assets/assets/images/FLD.gif": "2cd02d657975574a0a33daee272fb10b",
"assets/assets/images/contact_icon.png": "b67aa0ee98a692d7c6312b83c3d12c20",
"assets/assets/images/HPE.jpeg": "2725690278bac87c3a891a7d44647564",
"assets/assets/images/linkdin.png": "0afc9f15984c739994631ce61df05d50",
"assets/assets/images/reactJS.png": "81b4c60b40fd170b82f27041dd527a1d",
"assets/assets/images/pic_2.png": "a7ce8885e1c83193c21a28e582be4ac8",
"assets/assets/images/pic_0.png": "d420c41edcfd18134402e4b87f50f764",
"assets/assets/images/pic_1.png": "f3a6694e653499e70868e13e58fa151c",
"assets/assets/images/ML.png": "b74210577b91d4cde69741131a8c471c",
"assets/assets/images/gtkIcon.png": "bd5a8d0c3f09b6384dc2845815c581ba",
"assets/assets/images/bg1.jpeg": "afdcc9520e8b60bebe5c4d255fa6c4ec",
"assets/assets/images/out.gif": "50017548be79dce86ea250906709d191",
"assets/assets/images/nodeJS.png": "b2b964ab4e4b10d7107daba4ab9ff692",
"assets/assets/17343-programming.json": "8d09108ce5aba4e200e60d605cf4f6fc",
"assets/assets/projectDetails.json": "ab3e4df0c2b00a6622b8d3c7093617bc",
"canvaskit/canvaskit.js": "43fa9e17039a625450b6aba93baf521e",
"canvaskit/profiling/canvaskit.js": "f3bfccc993a1e0bfdd3440af60d99df4",
"canvaskit/profiling/canvaskit.wasm": "a9610cf39260f60fbe7524a785c66101",
"canvaskit/canvaskit.wasm": "04ed3c745ff1dee16504be01f9623498"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}

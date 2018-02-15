"use strict";
console.log('sw: executing.');

var version = 'v2::';

var offlineFundamentals = [
	'/jquery-1.12.4.min.js',
	'/jquery-3.2.1.min.js',
	
	'/4g-speed/',
	'/4g-speed/app.js'
];

self.addEventListener("install", function (event) {
	console.log('sw: install event in progress.');
	
	event.waitUntil(caches.open(version + 'fundamentals').then(function (cache) {
		return cache.addAll(offlineFundamentals);
	}).then(function () {
		console.log('sw: install completed');
	}));
});

self.addEventListener("fetch",function(event) {
	console.log('sw: fetch event in progress.');
	if (event.request.method !== 'GET') {
		console.log('sw: fetch event ignored.', event.request.method, event.request.url);
		return;
	}
	event.respondWith(
		caches.match(event.request).then(function(cached){
			var networked = fetch(event.request).then(fetchedFromNetwork,unableToResolve).catch(unableToResolve);
			
			console.log('sw: fetch event', cached ? '(cached)' : '(network)', event.request.url);
			return cached || networked;

			function fetchedFromNetwork(response) {
				var cacheCopy = response.clone();
				console.log('sw: fetch response from network.', event.request.url);
				caches.open(version + 'pages').then(function add(cache){
					cache.put(event.request, cacheCopy);
				}).then(function(){
					console.log('sw: fetch response stored in cache.', event.request.url);
				});
				return response;
			}

			function unableToResolve() {
				console.log('sw: fetch request failed in both cache and network.');
				return new Response('<h1>Service Unavailable</h1>', {
					status:503,
					statusText:'Service Unavailable',
					headers:new Headers({
						'Content-Type': 'text/html'
					})
				});
			}
		})
	);
});
self.addEventListener("activate", function (event){
	console.log('sw: activate event in progress.');
	event.waitUntil(
		caches.keys().then(function(keys){
			return Promise.all(
				keys.filter(function (key) {
					return !key.startsWith(version);
				}).map(function (key) {
					return caches.delete(key);
				})
			);
		}).then(function(){
			console.log('sw: activate completed.');
		})
	);
});
# Secure Storage Key Value Store

The Secure Storage plugin has a Key Value storage API called [KeyValueStorage](https://ionic.io/docs/secure-storage/key-value) that makes securely storing data on a mobile device easier.

This sample application uses `KeyValueStorage` in a real world scenario where it is used to allow the app to work offline by storing API results when online and returning cached data stored on the device when offline.

- [data-storage.service.ts](src/app/data-storage.service.ts) - This service reads and writes values using Secure Storage's `KeyValueStorage`
- [cache.service.ts](src/app/cache.service.ts) - This service handles caching from observables from `HttpClient` emitting cached or fresh data.
- [api.service.ts](src/app/api.service.ts) - This service handles requests to get data from the Star Wars API and uses `CacheService`
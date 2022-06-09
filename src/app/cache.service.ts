import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private cache = {};
    private cacheTime = {};

    public observe(
        key: string,
        observable: Observable<any>,
        options?: CacheOptions,
        storageProvider?: CacheStorageProvider
    ): Observable<any> {
        return Observable.create(async (observer) => {
            const emitDuplicates = (options) ? options.emitDuplicates : true;
            const alwaysGetValue = (options) ? options.alwaysGetValue : false;
            const readFunction = (storageProvider?.readValue) ? storageProvider.readValue : this.readInMemoryCache;
            const writeFunction = (storageProvider?.writeValue) ? storageProvider.writeValue : this.writeInMemoryCache;
            const cachedValue: CacheValue = await readFunction(key);

            if (cachedValue) {
                const age = Date.now() - cachedValue.created;
                const expiresMs = (options && options.expiresMs) ? options.expiresMs : Number.MAX_VALUE;

                if (age < expiresMs && !emitDuplicates) {
                    // Emit the cached value
                    observer.next(cachedValue.value);

                    // If we always get fresh value then do not complete here
                    if (!alwaysGetValue) {
                        observer.complete();
                        return;
                    }
                } else {
                    // Cached value has expired
                    if (alwaysGetValue) {
                        // Emit the cached value as we'll get a fresh value
                        observer.next(cachedValue.value);
                    }
                }
            }
            const subscription = observable.subscribe(async (value) => {
                await writeFunction(key, { created: Date.now(), value });
                if (!emitDuplicates && cachedValue) {
                    // If the fresh value is the same as the cached value then do not emit
                    if (JSON.stringify(cachedValue.value) === JSON.stringify(value)) {
                        observer.complete();
                        return;
                    }
                }

                observer.next(value);
                observer.complete();
                subscription.unsubscribe();
            }, (error) => { observer.error(error); });
        });
        ;
    }



    private async readInMemoryCache(key: string): Promise<CacheValue> {
        return Promise.resolve(this.cache[key]);
    }

    private async writeInMemoryCache(key: string, data: CacheValue): Promise<void> {
        this.cache[key] = data;
        this.cacheTime[key] = Date.now();
        Promise.resolve();
    };


}

export class CacheStrategy {
    public static oneMinute: CacheOptions = { expiresMs: 60000 };
    public static oneHour: CacheOptions = { expiresMs: 3600000 };
    public static oneDay: CacheOptions = { expiresMs: 86400000 };
    public static fresh: CacheOptions = { alwaysGetValue: true, emitDuplicates: false };
}

export interface CacheValue {
    value: any;
    created: number;
}

export interface CacheStorageProvider {
    // read function to get stored value
    readValue?: (key: string) => Promise<CacheValue>;

    // write function to set stored value
    writeValue?: (key: string, value: CacheValue) => Promise<void>;
}

export interface CacheOptions {
    // Time in milliseconds before the cached value expires
    // Default: unlimited
    expiresMs?: number;

    // Whether to always get a fresh value. If try 2 values will be emitted: the cached and fresh values
    // Default: false
    alwaysGetValue?: boolean;

    // Whether a duplicate value will be emitted.
    emitDuplicates?: boolean;
}

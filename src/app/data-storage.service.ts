import { CacheStorageProvider, CacheValue } from './cache.service';
import { KeyValueStorage } from '@ionic-enterprise/secure-storage/ngx';
import { Injectable, OnInit } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DataStorageService implements CacheStorageProvider {
    private ready: Promise<void>;

    constructor(private storage: KeyValueStorage) {
        this.ready = this.storage.create('super-secret-key-here');
    }

    public async readValue(key: string): Promise<CacheValue> {
        try {
            await this.ready;
            return JSON.parse(await this.storage.get(key));
        } catch {
            return undefined;
        }
    }

    public async writeValue(key: string, value: CacheValue): Promise<void> {
        await this.ready;
        await this.storage.set(key, JSON.stringify(value));
    }

    public async clear(): Promise<void> {
        await this.ready;
        await this.storage.clear();
    }
}

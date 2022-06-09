import { CacheStorageProvider, CacheValue } from './cache.service';
import { KeyValueStorage } from '@ionic-enterprise/secure-storage/ngx';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class DataStorageService implements CacheStorageProvider {
    constructor(private storage: KeyValueStorage) {
    }

    public async readValue(key: string): Promise<CacheValue> {
        try {
            return JSON.parse(await this.storage.get(key));
        } catch {
            return undefined;
        }
    }

    public async writeValue(key: string, value: CacheValue): Promise<void> {
        await this.storage.set(key, JSON.stringify(value));
    }
}

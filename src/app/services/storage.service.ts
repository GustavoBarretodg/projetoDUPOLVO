import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage'

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor(
        private storage: Storage
    ) {

    }

    async set(key: string, value: any) {
        await this.storage.set(key, value);
    }

    async get(key: string) {
        return await this.storage.get(key);
    }

    async removeItem(key: string) {
        await this.storage.remove(key);
    }

    async clear() {
        await this.storage.clear();
    }
}

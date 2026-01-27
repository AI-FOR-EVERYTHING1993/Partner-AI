import { DatabaseService } from './types';
import { LocalStorageService } from './firebase';

// Using localStorage for simple data persistence
export const databaseService: DatabaseService = new LocalStorageService();
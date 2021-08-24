import { User } from '@indigobit/nubia.common';
import { Injectable } from '@nestjs/common';

// Use JSON file for storage
export type DbData = {
  users: User[];
};

@Injectable()
export class DBService {
  readonly db: { data: DbData };

  get users() {
    return this.db.data.users;
  }

  constructor() {
    this.db = { data: { users: [] } };
  }
}

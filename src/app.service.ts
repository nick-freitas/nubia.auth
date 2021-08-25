import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateUserEvent,
  UpdateUserEvent,
  User,
} from '@indigobit/nubia.common';
import { DBService } from './db.service';

@Injectable()
export class AppService {
  constructor(private readonly DBService: DBService) {}

  async createUser(data: CreateUserEvent['data']): Promise<any> {
    const { fullName, id, email, password } = data;

    if (!email) {
      throw new Error('Missing Email');
    }
    if (!password) {
      throw new Error('Missing Password');
    }
    if (!fullName) {
      throw new Error('Missing Full Name');
    }
    if (!id) {
      throw new Error('Missing Id');
    }

    const user: User = {
      id: id,
      email: email,
      fullName: fullName,
      password: password,
      active: true,
      createdAt: new Date(),
      version: 1,
    };

    this.DBService.users.push({ ...user });

    delete user.password;

    return user;
  }

  async updateUser(data: UpdateUserEvent['data']): Promise<any> {
    const { fullName, id } = data;

    if (!fullName) {
      // rest
      throw new Error('Missing Full Name');
    }

    if (!id) {
      throw new Error('Missing Id');
    }

    const index = this.DBService.users.findIndex(
      (user) => user.id === id && user.active === true,
    );
    if (index === -1)
      throw new BadRequestException('Bad Id in User Update Request');

    const user = { ...this.DBService.users[index] };
    user.fullName = fullName;
    user.version += 1;
    this.DBService.users[index] = { ...user };

    delete user.password;

    return user;
  }
}

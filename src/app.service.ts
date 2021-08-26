import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthorizedUser,
  CreateUserEvent,
  UpdateUserEvent,
  User,
} from '@indigobit/nubia.common';
import { DBService } from './db.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppService {
  constructor(
    private readonly DBService: DBService,
    private jwtService: JwtService,
  ) {}

  async createUser(data: CreateUserEvent['data']): Promise<AuthorizedUser> {
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

    let user: User = { ...this.DBService.users.find((u) => u.id === id) };
    // if the id exists, this event was already processed.
    if (user) {
      return {
        ...user,
        ...this.signIn(await this.validateUser(user.email, user.password)),
      };
    }

    user = { ...this.DBService.users.find((u) => u.email === email) };
    if (user) throw new BadRequestException('Email is already in use');

    user = {
      id: id,
      email: email,
      fullName: fullName,
      password: await bcrypt.hash(password, 12),
      active: true,
      createdAt: new Date(),
      version: 1,
    };

    this.DBService.users.push({ ...user });

    return {
      ...user,
      ...this.signIn(await this.validateUser(user.email, user.password)),
    };
  }

  async updateUser(data: UpdateUserEvent['data']): Promise<User> {
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

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.DBService.users.find(
      (user) => user.email === email,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid Email');
    }

    const matched = await bcrypt.compare(pass, user?.password);
    if (!matched) {
      throw new UnauthorizedException('Invalid Password');
    }

    return user;
  }

  signIn(user: User): { access_token: string } {
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

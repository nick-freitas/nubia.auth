import { User } from '@indigobit/nubia.common';
import { BadRequestException, Injectable } from '@nestjs/common';
// import { Low, JSONFile } from 'lowdb';

// Use JSON file for storage
type Data = {
  users: User[];
};
// const adapter = new JSONFile<Data>('db.json');
// const db = new Low<Data>(adapter);
const db: { data: Data } = { data: { users: [] } };

@Injectable()
export class AppService {
  async createUser(data: Partial<User>): Promise<any> {
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

    // await db.read();
    // db.data ||= { users: [] };

    const user: User = {
      email: email,
      fullName: fullName,
      id: id,
      password: password,
      active: true,
      createdAt: new Date(),
      version: 1,
    };

    db.data.users.push(user);

    console.log('about to return in ms');

    const { password: _password, ...remainder } = user;

    return remainder;
  }

  async updateUser(data: Partial<User>): Promise<any> {
    const { fullName, id } = data;

    if (!fullName) {
      throw new Error('Missing Full Name');
    }
    if (!id) {
      throw new Error('Missing Id');
    }

    const index = db.data.users.findIndex(
      (user) => user.id === id && user.active === true,
    );
    if (index === -1)
      throw new BadRequestException('Bad Id in User Update Request');

    const user = db.data.users[index];
    user.fullName = fullName;
    user.version += 1;

    const { password, ...remainder } = user;

    return remainder;

    // const reply = this.authClient
    //   .send<string>('gamebooks', {
    //     type: UserEventType.USER_UPDATED,
    //     data: remainder,
    //   })
    //   .pipe(map((message: string) => console.info(message)))
    //   .toPromise();

    // return reply;
  }
}

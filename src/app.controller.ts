import {
  CreateUserEvent,
  isCreateUserEvent,
  isUpdateUserEvent,
  Topics,
  UpdateUserEvent,
  UserEvent,
} from '@indigobit/nubia.common';
import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(Topics.USERS)
  users(
    @Payload() { value }: { value: CreateUserEvent | UpdateUserEvent },
  ): any {
    console.log('message pattern users in auth');
    const { type, data, auth } = value;
    if (!type) {
      throw new BadRequestException('Missing "type" in UserEvent');
    }

    console.log(type);

    if (isCreateUserEvent(value)) {
      return this.appService.createUser(data as CreateUserEvent['data']);
    }

    if (isUpdateUserEvent(value)) {
      return this.appService.updateUser(data as UpdateUserEvent['data']);
    }

    console.log(`Ignoring ${type}`);
  }
}

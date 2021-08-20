import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getTest(message: any): string {
    return `Hello, this is the Auth Service. We just receive a request with the message ${message} from you.`;
  }
}

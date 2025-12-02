import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  create(username: string, password: string): User {
    const user: User = { id: this.nextId++, username, password };
    this.users.push(user);
    return user;
  }

  findByUsername(username: string): User | undefined {
    return this.users.find((u) => u.username === username);
  }

  validateUser(username: string, password: string): User | null {
    const user = this.findByUsername(username);
    if (!user || user.password !== password) return null;
    return user;
  }
}

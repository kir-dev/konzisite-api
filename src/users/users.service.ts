import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto): Promise<User> {
    return null;
  }

  async findAll(): Promise<User[]> {
    return null;
  }

  async findOne(id: string): Promise<User> {
    return null;
  }

  async findByAuthSchId(authSchId: string): Promise<User> {
    return null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return null;
  }

  async remove(id: string): Promise<User> {
    return null;
  }
}

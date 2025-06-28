import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './schemas/create-user.schema';
import { UpdateUserDto } from './schemas/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { HashService } from 'src/hash/hash.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashService.hash(createUserDto.password);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    const { password, ...safeUser } = user;
    return safeUser;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDTO } from 'src/users/dto/register-user.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {}

	async findByUsername(username: string): Promise<User | null> {
		return this.usersRepository.findOne({ where: { username } });
	}

	async findById(id: number): Promise<User | null> {
		return this.usersRepository.findOne({ where: { id } });
	}

	async create(newUserData: RegisterUserDTO): Promise<User> {
		const existingUser = await this.findByUsername(newUserData.username);
		if (existingUser) {
			throw new ConflictException(
				'Пользователь с таким именем или email уже существует',
			);
		}

		const user = this.usersRepository.create(newUserData);
		return this.usersRepository.save(user);
	}
}

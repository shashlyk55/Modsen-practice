import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDTO } from './dto/register-user.dto';

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
				'user with this email is already exists',
			);
		}

		const user = this.usersRepository.create(newUserData);
		return this.usersRepository.save(user);
	}

	async getUser(userId: number): Promise<User | null> {
		const user = await this.usersRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.articles', 'articles')
			.where('user.id = :userId', { userId })
			.select([
				'user.username',
				'user.createdAt',
				'articles.id',
				'articles.header',
				'articles.createdAt',
			])
			.getOne();

		if (!user) {
			throw new NotFoundException('user not found');
		}

		return user;
	}
}

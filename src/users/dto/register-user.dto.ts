import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDTO {
	@IsString()
	@MinLength(3)
	@MaxLength(20)
	username: string;

	@IsString()
	@MinLength(8)
	@MaxLength(20)
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'Пароль слишком слабый',
	})
	password: string;
}

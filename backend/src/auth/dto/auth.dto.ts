import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class AuthDto {
	@IsEmail()
	email: string;

	@MinLength(16, {
		message: 'Password must be at least 16 characters long'
	})
	@IsString()
	password: string;

	@IsString()
	firstName: string;

	@IsString()
	lastName: string;

	@IsOptional()
	@IsString()
	middleName?: string;

	@IsString()
	phone: string;

	@IsString()
	nickName: string;
}

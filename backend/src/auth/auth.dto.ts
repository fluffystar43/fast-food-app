import { IsEmail, IsString, MinLength } from "class-validator";

export class AuthDto {
    @IsEmail()
    email: string;

    @MinLength(16, {
        message: 'Password must be at least 16 characters long',
    }) 
    @IsString()
    password: string;
}
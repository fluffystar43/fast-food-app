import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { hash } from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService
	) {}

	async register(dto: AuthDto) {
		const existUser = this.prisma.user.findUnique({
			where: {
				email: dto.email
			}
		});

		if (existUser) {
			throw new BadRequestException('User already exists');
		}

		const newUser = await this.prisma.user.create({
			data: {
				email: dto.email,
				password: await hash(dto.password),
				firstName: dto.firstName,
				lastName: dto.lastName,
				middleName: dto.middleName,
				phone: dto.phone,
				nickName: dto.nickName
			}
		});

		return newUser;
	}

	private async issueTokens(userId: string) {
		const data = { id: userId };

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		});

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
		});

		return { accessToken, refreshToken };
	}
}

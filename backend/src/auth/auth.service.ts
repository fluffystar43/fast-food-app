import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService
	) {}

	async login(dto: RegisterDto) {
		const user = await this.validateUser(dto);

		const tokens = await this.issueTokens(user.id);

		return {
			user: this.returnUserFields(user),
			...tokens
		};
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken);
		if (!result) {
			throw new UnauthorizedException('Invalid refresh token');
		}

		const user = await this.prisma.user.findUnique({
			where: {
				id: result.id
			}
		});

		const tokens = await this.issueTokens(user.id);

		return {
			user: this.returnUserFields(user),
			...tokens
		};
	}

	async register(dto: AuthDto) {
		const existUser = await this.prisma.user.findUnique({
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

		const tokens = await this.issueTokens(newUser.id);

		return {
			user: this.returnUserFields(newUser),
			...tokens
		};
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

	private returnUserFields(user: User) {
		return {
			id: user.id,
			email: user.email
		};
	}

	private async validateUser(dto: RegisterDto) {
		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email
			}
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		const isValid = verify(user.password, dto.password);

		if (!isValid) {
			throw new UnauthorizedException('Invalid password');
		}

		return user;
	}
}

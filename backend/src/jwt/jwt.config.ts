import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = async (
	config: ConfigService
): Promise<JwtModuleOptions> => ({
	secret: config.get('JWT_SECRET'),
	signOptions: {
		expiresIn: config.get('JWT_EXPIRATION_TIME')
	}
});

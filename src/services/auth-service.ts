import bcrypt from "bcryptjs";
import InvalidCredentialsException from "@/exceptions/invalid-credentials-exception";
import { authRepository } from "@/repository/auth-repository";
import { signToken } from "@/lib/jwt";
import { Login } from "@/types/auth";

export class AuthService {
  static async login(data: Login) {
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw new InvalidCredentialsException("email or password is incorrect");
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password_hash);
    if (!passwordMatches) {
      throw new InvalidCredentialsException("email or password is incorrect");
    }

    const token = signToken(user.user_id);
    return token;
  }
}
import prisma from "@/lib/db";

export class authRepository {
  static async findByEmail(email: string) {
    return prisma.users.findUnique({
      where: { email },
    });
  }
}
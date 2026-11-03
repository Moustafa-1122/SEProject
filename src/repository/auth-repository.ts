import prisma from "@/lib/db";

export class authRepository {
  static async findByEmail(email: string) {
    return prisma.users.findUnique({
      where: { email },
    });
  }

  static async findById(user_id: number) {
    return prisma.users.findUnique({
      where: { user_id },
    });
  }

  static async updatePassword(user_id: number, password_hash: string) {
    return prisma.users.update({
      where: { user_id },
      data: { password_hash },
    });
  }
}

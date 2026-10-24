import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRY = "12h"; // NFR-008: end session after 12 hours

export function signToken(user_id: number){
  return jwt.sign({ user_id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { user_id: number };
}
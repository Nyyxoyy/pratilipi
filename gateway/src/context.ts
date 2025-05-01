import { verify } from 'jsonwebtoken';

export interface ContextData {
  token?: string;
}

export class Context {
  private token?: string;
  private userId?: string;

  constructor(data: ContextData) {
    this.token = data.token;
    if (this.token) {
      try {
        const decoded = verify(this.token, process.env.JWT_SECRET as string) as { id: string };
        this.userId = decoded.id;
      } catch (error) {
        // Token is invalid or expired, but we don't throw here
        // The resolvers will handle authorization
      }
    }
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  getToken(): string | undefined {
    return this.token;
  }
} 
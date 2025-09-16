import { getCurrentUser as getCurrentUserNextAuth, authOptions as nextAuthOptions } from "./nextauth";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

declare global {
  interface CustomJwtSessionClaims {
    user?: User & {
      id: string;
      isAdmin: boolean;
    }
  }
}

export const authOptions = nextAuthOptions;

export async function getCurrentUser() {
  return await getCurrentUserNextAuth();
}

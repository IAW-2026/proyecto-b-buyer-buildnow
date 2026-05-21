import {
  auth,
  clerkClient,
} from "@clerk/nextjs/server";

type SessionClaimsWithRole = {
  metadata?: {
    role?: string;
  };
  publicMetadata?: {
    role?: string;
  };
};

export async function getCurrentUser() {
  const { userId, sessionClaims } = await auth();
  const claims =
    sessionClaims as SessionClaimsWithRole | null;

  let role =
    claims?.metadata?.role ??
    claims?.publicMetadata?.role ??
    null;

  if (userId && !role) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const publicRole = user.publicMetadata.role;

    role =
      typeof publicRole === "string"
        ? publicRole
        : null;
  }

  return {
    userId,
    role,
    isAuthenticated: Boolean(userId),
  };
}

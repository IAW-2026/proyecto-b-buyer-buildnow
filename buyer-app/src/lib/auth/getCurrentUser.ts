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

  let publicMetadataRole: string | null = null;

  if (userId) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const publicRole = user.publicMetadata.role;

    publicMetadataRole =
      typeof publicRole === "string"
        ? publicRole
        : null;
  }

  const role =
    publicMetadataRole ??
    claims?.publicMetadata?.role ??
    claims?.metadata?.role ??
    null;
  const roleSource = publicMetadataRole
    ? "clerk_public_metadata"
    : claims?.publicMetadata?.role
      ? "session_public_metadata"
      : claims?.metadata?.role
        ? "session_metadata"
        : "none";

  return {
    userId,
    role,
    roleSource,
    isAuthenticated: Boolean(userId),
  };
}

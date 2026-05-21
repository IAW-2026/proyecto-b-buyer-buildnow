import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

export async function assignBuyerRole(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if (user.publicMetadata.role === "buyer") {
    return;
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      role: "buyer",
    },
  });
}

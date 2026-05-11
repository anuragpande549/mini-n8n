import { prisma } from "./db";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();
  if (!user) {
    throw new Error("User not found in Clerk");
  }

  const email = user.emailAddresses[0]?.emailAddress;

  const dbUser = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email: email,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    },
    create: {
      clerkId: userId,
      email: email,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    },
  });

  return dbUser;
}

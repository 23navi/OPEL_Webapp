"use server";

import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const onAuthenticateUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 403, message: "User not found" };
    }

    const userExist = await client.user.findUnique({
      where: {
        clerkid: user.id,
      },
      include:{
        workspace: true
      }
    });

    return { status: 200, user };
  } catch (error) {
    console.log(error);
    return { status: 500, message: "Internal server error" };
  }
};

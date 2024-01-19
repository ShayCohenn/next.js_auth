"use server";

import { RegisterSchema } from "@/schemas";
import * as z from "zod";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { ObjectId } from "mongodb";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;

  const generatedId = new ObjectId();
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) return { error: "Email already exists!" };

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      id: generatedId.toHexString(),
    },
  });

  //TODO: Send verificatioon token email

  return { success: "Email sent!" };
};

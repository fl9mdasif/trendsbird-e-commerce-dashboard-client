"use server";

import { FieldValues } from "react-hook-form";
import { cookies } from "next/headers";
import { authKey } from "@/contains/authKey";

export const loginUser = async (data: FieldValues) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  const userInfo = await res.json();

  if (userInfo?.success && userInfo?.data?.accessToken) {
    (await cookies()).set(authKey, userInfo.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  return userInfo;
};

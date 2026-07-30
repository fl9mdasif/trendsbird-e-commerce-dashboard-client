"use server";

import { FieldValues } from "react-hook-form";

export const registerUser = async (data: FieldValues) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const registerInfo = await res.json();
  return registerInfo;
};

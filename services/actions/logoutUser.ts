"use server";

import { cookies } from "next/headers";
import { authKey } from "@/contains/authKey";

export const logoutUser = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const logoutInfo = await res.json();

    if (logoutInfo?.success) {
        (await cookies()).delete(authKey);
        (await cookies()).delete("refreshToken");
    }

    return logoutInfo;
};

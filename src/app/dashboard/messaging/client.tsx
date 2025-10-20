"use client";

export const sendMessageAPI = async (numbers: string[], message: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numbers, message }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

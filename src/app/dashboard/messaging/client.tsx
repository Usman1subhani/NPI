"use client";

export const sendMessageAPI = async (numbers: string[], message: string) => {
  try {
    const responses = await Promise.all(
      numbers.map(async (num) => {
        const res = await fetch(
          // `${process.env.NEXT_PRIVATE_BACKEND_URL}/ringcentral/send-sms?to=${encodeURIComponent(num)}&message=${encodeURIComponent(message)}`
          `http://192.168.18.110:8000/ringcentral/send-sms?to=${encodeURIComponent(num)}&message=${encodeURIComponent(message)}`
        );

        if (!res.ok) throw new Error(`Failed to send to ${num}`);
        const data = await res.json().catch(() => ({}));
        return { number: num, success: true, data };
      })
    );

    return { success: true, results: responses };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: String(error) };
  }
};

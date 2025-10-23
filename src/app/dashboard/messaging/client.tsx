"use client";

export const sendMessageAPI = async (numbers: string[], message: string) => {
  try {
    const responses = await Promise.all(
      numbers.map(async (num) => {
        // Remove the '+' prefix if it exists and ensure clean number
        const cleanNumber = num.replace(/^\+/, '');
        
        const res = await fetch(
          `https://gofernets.run.place/nppes/ringcentral/send-sms?to=${cleanNumber}&message=${encodeURIComponent(message)}`
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

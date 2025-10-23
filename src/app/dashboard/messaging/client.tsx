"use client";

export const sendMessageAPI = async (numbers: string[], message: string) => {
  try {
    const responses = await Promise.all(
      numbers.map(async (num) => { 
        const cleanNumber = num.replace(/^\+/, '');
           
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/ringcentral/send-sms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: cleanNumber,
              message: message
            })
          }
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

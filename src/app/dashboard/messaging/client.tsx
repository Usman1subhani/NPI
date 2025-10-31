"use client";

export const sendMessageAPI = async (
  numbers: string[],
  message: string
): Promise<{
  success: boolean;
  results?: Array<{ number: string; success: boolean; data?: any; error?: string }>;
  error?: string;
}> => {
  // Helper: sleep for X ms
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const responses: Array<{ number: string; success: boolean; data?: any; error?: string }> = [];
  try {
    for (let i = 0; i < numbers.length; i++) {
      const num = numbers[i];
      const cleanNumber = num.replace(/^\+/, "");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ringcentral/send-sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: cleanNumber, message }),
        });

        const text = await res.text().catch(() => "");
        let data: any = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          data = { raw: text };
        }

        if (!res.ok) {
          const errMsg = data?.message || res.statusText || "Request failed";
          responses.push({ number: num, success: false, error: String(errMsg), data });
        } else {
          responses.push({ number: num, success: true, data });
        }


      } catch (err) {
        responses.push({ number: num, success: false, error: String(err), data: null });
      }
      // ⏳ Wait 5 seconds before sending the next message (except after the last one)
      if (i < numbers.length - 1) {
        await delay(5000);
        console.log("Waiting 5 seconds before sending the next message...", num);
      }
    }

    const overallSuccess = responses.some((r) => r.success);
    return { success: overallSuccess, results: responses };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: String(error) };
  }
};





// export const sendMessageAPI = async (
//   numbers: string[],
//   message: string
// ): Promise<{
//   success: boolean;
//   results?: Array<{ number: string; success: boolean; data?: any; error?: string }>;
//   error?: string;
// }> => {
//   const endpoint = process.env.NEXT_PUBLIC_BACKEND_URL;

//   try {
//     const responses = await Promise.all(
//       numbers.map(async (num) => {
//         const cleanNumber = num.replace(/^\+/, "");

//         try {
//           const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ringcentral/send-sms`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ to: cleanNumber, message }),
//           });

//           const text = await res.text().catch(() => "");
//           let data: any = {};
//           try {
//             data = text ? JSON.parse(text) : {};
//           } catch (e) {
//             data = { raw: text };
//           }

//           if (!res.ok) {
//             const errMsg = data?.message || res.statusText || "Request failed";
//             return { number: num, success: false, error: String(errMsg), data };
//           }

//           return { number: num, success: true, data };
//         } catch (err) {
//           return { number: num, success: false, error: String(err), data: null };
//         }
//       })
//     );

//     const overallSuccess = responses.some((r) => r.success);
//     return { success: overallSuccess, results: responses };
//   } catch (error) {
//     console.error("Error sending message:", error);
//     return { success: false, error: String(error) };
//   }
// };


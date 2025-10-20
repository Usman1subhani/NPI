// import React from "react";
// import Messaging from "@/components/dashboard/Messaging/Messaging";

// export const metadata = {
//   title: "Messaging | Dashboard",
// };

// export default function Page() {
//   return <Messaging />;
// }

import { Metadata } from "next";
import MessagingPageClient from "@/app/dashboard/messaging/page-client"; // 👈 new client wrapper

export const metadata: Metadata = {
  title: "Messaging | Dashboard",
};

export default function Page() {
  return <MessagingPageClient />;
}

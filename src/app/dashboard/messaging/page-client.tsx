"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Messaging from "@/components/dashboard/Messaging/Messaging";

export default function MessagingPageClient() {
  const searchParams = useSearchParams();
  const totalParam = searchParams.get("total");
  const initialNumbers = totalParam ? decodeURIComponent(totalParam).split(",") : [];

  return <Messaging initialNumbers={initialNumbers} />;
}

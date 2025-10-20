"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Messaging from "@/components/dashboard/Messaging/Messaging";

export default function MessagingPageClient() {
  const searchParams = useSearchParams();
  const toParam = searchParams.get("to");
  const initialNumbers = toParam ? decodeURIComponent(toParam).split(",") : [];

  return <Messaging initialNumbers={initialNumbers} />;
}

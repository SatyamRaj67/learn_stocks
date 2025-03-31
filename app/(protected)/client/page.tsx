"use client";

import { UserInfo } from "@/components/auth/user-info";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import React from "react";

const ClientPage = () => {
  const user = useCurrentUser();
  return <UserInfo label="📱Client Component" user={user} />;
};

export default ClientPage;

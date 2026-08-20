"use client";

import { StaffChatPanel } from "@/components/chat/staff-chat-panel";

export default function AdminJudgeChatPage() {
  return (
    <StaffChatPanel
      title="Chat with judges"
      subtitle="Message judges directly from the admin desk"
    />
  );
}

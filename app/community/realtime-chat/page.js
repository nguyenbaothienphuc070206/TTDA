import ChatRealtime from "@/components/chat/ChatRealtime";

export const metadata = {
  title: "Realtime Community Chat",
};

export default function RealtimeChatPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <ChatRealtime beltGroup="all" />
    </div>
  );
}

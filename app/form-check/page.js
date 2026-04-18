import { redirect } from "next/navigation";

export const metadata = {
  title: "Chấm chữa kỹ thuật",
};

export default function FormCheckPage() {
  redirect("/cham-chua");
}

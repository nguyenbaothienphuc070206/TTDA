import { redirect } from "next/navigation";

export const metadata = {
  title: "Chấm chữa kỹ thuật",
};

export default function FormCheckPage() {
  redirect("/hoc-tap#cham-chua-ky-thuat");
}

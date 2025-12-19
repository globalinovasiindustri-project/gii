import { redirect } from "next/navigation";

export default function MyOrderPage() {
  redirect("/user/orders");
}

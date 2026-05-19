import { redirect } from "next/navigation";
import { storefrontSettings } from "@/lib/store-settings";

export default function Home() {
  redirect(`/${storefrontSettings.defaultLocale}`);
}

import { redirect } from "next/navigation";
import { i18n } from "~/config/i18n-config";

export default function RootPage() {
  // 重定向到默认语言
  redirect(`/${i18n.defaultLocale}`);
}

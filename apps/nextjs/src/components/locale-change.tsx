"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@saasfly/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@saasfly/ui/dropdown-menu";
import * as Icons from "@saasfly/ui/icons";

import { i18n, localeMap } from "~/config/i18n-config";

export function LocaleChange({ url }: { url: string }) {
  const router = useRouter();
  const pathname = usePathname();

  // 自动从当前路径中移除已有的语言前缀，再拼接新语言，保证全站切换生效
  function onClick(locale: string) {
    const segments = (pathname || "/").split("/").filter(Boolean);
    const currentLocale = segments[0];
    const rest = i18n.locales.includes(currentLocale as any)
      ? "/" + segments.slice(1).join("/")
      : (pathname || "/");
    const target = `/${locale}` + (rest === "/" ? "" : rest);
    router.push(target);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <Icons.Languages />
          <span className="sr-only"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div>
          {i18n.locales.map((locale) => {
            return (
              // <Link href={redirectedPathName(locale)}>{locale}</Link>
              <DropdownMenuItem key={locale} onClick={() => onClick(locale)}>
                <span>{localeMap[locale]}</span>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

import { UserAuthForm } from "~/components/user-auth-form";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href={`/${lang}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8",
        )}
      >
        <>
          <Icons.ChevronLeft className="mr-2 h-4 w-4" />
          {dict.login.back}
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <span className="text-2xl font-bold text-white">I2P</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Image to Prompt
          </h1>
          <p className="text-sm text-muted-foreground">
            将您的图片转换为高质量的 AI 提示词
          </p>
        </div>
        <div className="mt-6">
          <UserAuthForm lang={lang} dict={dict.login} />
        </div>
      </div>
    </div>
  );
}

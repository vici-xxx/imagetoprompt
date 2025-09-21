"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@saasfly/ui/button";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>加载中...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">未登录</p>
        <Button asChild>
          <a href="/zh/login">登录</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div>
        <h3 className="text-lg font-semibold">欢迎回来！</h3>
        <p className="text-muted-foreground">
          {session?.user?.name || session?.user?.email}
        </p>
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt="用户头像"
            className="w-16 h-16 rounded-full mx-auto mt-2"
          />
        )}
      </div>
      <div className="space-x-2">
        <Button asChild>
          <a href="/zh/imageprompt/generator">开始使用</a>
        </Button>
        <Button variant="outline" onClick={() => signOut()}>
          退出登录
        </Button>
      </div>
    </div>
  );
}

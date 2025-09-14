import { NextResponse, type NextRequest } from "next/server";

// 暂时禁用 Stripe webhook 以避免数据库连接问题
const handler = async (req: NextRequest) => {
  console.log("Stripe webhook disabled for build");
  return NextResponse.json({ message: "Stripe webhook disabled" }, { status: 200 });
};

export { handler as GET, handler as POST };

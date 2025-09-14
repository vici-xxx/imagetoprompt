// import { authRouter } from "./router/auth";
// import { customerRouter } from "./router/customer";
import { helloRouter } from "./router/health_check";
// import { k8sRouter } from "./router/k8s";
// import { stripeRouter } from "./router/stripe";
import { createTRPCRouter } from "./trpc";

// 创建空的路由器用于构建时（避免数据库连接问题）
const emptyRouter = createTRPCRouter({});

export const edgeRouter = createTRPCRouter({
  // stripe: stripeRouter,
  hello: helloRouter,
  // k8s: k8sRouter,
  // auth: authRouter,
  // customer: emptyRouter,
});

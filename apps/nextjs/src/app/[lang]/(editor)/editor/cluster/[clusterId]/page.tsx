import { notFound } from "next/navigation";

// 暂时禁用数据库相关功能以避免构建问题
interface EditorClusterProps {
  params: {
    clusterId: number;
    lang: string;
  };
}

export default async function EditorClusterPage({
  params,
}: EditorClusterProps) {
  // 暂时返回简单的页面，避免数据库连接问题
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Cluster Editor</h1>
      <p className="text-gray-600">
        Cluster ID: {params.clusterId}
      </p>
      <p className="text-gray-600">
        Language: {params.lang}
      </p>
      <p className="text-sm text-gray-500 mt-4">
        This feature is temporarily disabled during build.
      </p>
    </div>
  );
}

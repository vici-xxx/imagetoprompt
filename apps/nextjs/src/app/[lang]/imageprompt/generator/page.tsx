"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@saasfly/ui/button";

export default function GeneratorPage({ params }: { params: { lang: string } }) {
  const initialLang = params?.lang === "zh" ? "zh" : "en";
  const [uiLang, setUiLang] = useState<"en" | "zh">(initialLang);
  const lang = uiLang;
  const t = uiLang === "zh" ? {
    title: "免费图像提示生成器",
    subtitle: "将图像转换为提示词，生成属于自己的图像。",
    uploadTitle: "上传图片或拖拽到此处",
    uploadSize: "PNG、JPG 或 WEBP，最大 5MB",
    previewPlaceholder: "您的图像将显示在这里",
    chooseFile: "选择文件",
    noFile: "未选择任何文件",
    tabs: [
      { title: "通用图像提示", desc: "针对通用图像提示进行了优化的预设。" },
      { title: "Flux", desc: "针对 Flux 进行了优化的预设。" },
      { title: "Midjourney", desc: "针对 Midjourney 进行了优化的预设。" },
      { title: "Stable Diffusion 稳定扩散", desc: "针对稳定扩散进行了优化的预设。" },
    ],
    labelPromptLang: "提示语言",
    labelInputKey: "工作流输入键",
    labelPromptType: "提示类型",
    btnGenerate: "生成提示",
  } : {
    title: "Free Image to Prompt Generator",
    subtitle: "Convert image to prompt to generate your own image.",
    uploadTitle: "Upload a photo or drag and drop",
    uploadSize: "PNG, JPG, or WEBP up to 5MB",
    previewPlaceholder: "Your image will show here",
    chooseFile: "Choose File",
    noFile: "No file selected",
    tabs: [
      { title: "General Image Prompt", desc: "Preset optimized for General Image Prompt." },
      { title: "Flux", desc: "Preset optimized for Flux." },
      { title: "Midjourney", desc: "Preset optimized for Midjourney." },
      { title: "Stable Diffusion", desc: "Preset optimized for Stable Diffusion." },
    ],
    labelPromptLang: "Prompt Language",
    labelInputKey: "Workflow input key",
    labelPromptType: "Prompt type",
    btnGenerate: "Generate Prompt",
  };
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [promptType, setPromptType] = useState<string>("flux");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  function onSelect(f: File) {
    console.log("onSelect called with file:", f.name);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setPrompt("");
    setError("");
    setFileName(f.name || "");
    console.log("File state updated, preview URL created");
  }

  async function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onSelect(f);
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("File upload triggered", e.target.files);
    const f = e.target.files?.[0];
    if (f) {
      console.log("File selected:", f.name, f.size, f.type);
      onSelect(f);
    }
  }

  async function generate() {
    if (!file) {
      console.log("No file selected, cannot generate");
      return;
    }
    console.log("Starting generation with file:", file.name);
    setIsLoading(true);
    setError("");
    setPrompt("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("language", uiLang);
      fd.append("input_key", "img");
      fd.append("promptType", promptType);
      fd.append("useQuery", "");
      console.log("Sending request to /api/imageprompt");
      const res = await fetch("/api/imageprompt", {
        method: "POST",
        body: fd,
      });
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);
      if (!res.ok) {
        setError(typeof data === "string" ? data : data?.error || "Failed to generate prompt");
        return;
      }
      if (data?.error) {
        setError(data?.error + (data?.details ? `: ${data.details}` : ""));
        return;
      }
      setPrompt(data?.prompt || "");
    } catch (e) {
      console.error("Generation error:", e);
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container py-10">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span>{uiLang === "zh" ? "语言" : "Language"}:</span>
          <select
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={uiLang}
            onChange={(e)=> setUiLang(e.target.value as any)}
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div
          className="rounded-xl border border-dashed p-6 h-[420px] flex items-center justify-center text-center"
          onDragOver={(e)=> e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="text-center">
            <div className="text-5xl">⬆️</div>
            <div className="mt-2">{t.uploadTitle}</div>
            <div className="mt-1 text-xs text-muted-foreground">{t.uploadSize}</div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <input id="file-input" className="hidden" type="file" accept="image/*" onChange={onUpload} />
              <label htmlFor="file-input"><Button size="sm">{t.chooseFile}</Button></label>
              <span className="text-xs text-muted-foreground">{fileName || t.noFile}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-6 h-[420px] flex items-center justify-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-muted-foreground">{t.previewPlaceholder}</div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {t.tabs.map((tab)=> (
          <div key={tab.title} className="rounded-xl border p-4 bg-background/50 text-sm">
            <div className="font-medium">{tab.title}</div>
            <div className="mt-1 text-muted-foreground">{tab.desc}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <label className="text-sm">{t.labelPromptType}</label>
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={promptType}
          onChange={(e)=> setPromptType(e.target.value)}
        >
          <option value="flux">Flux</option>
          <option value="mj">Midjourney</option>
          <option value="sd">Stable Diffusion</option>
          <option value="general">General</option>
        </select>

        <Button onClick={generate} disabled={!file || isLoading}>
          {isLoading ? (lang === "zh" ? "生成中..." : "Generating...") : t.btnGenerate}
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {prompt && (
        <div className="mt-6 rounded-xl border p-4">
          <div className="text-sm font-medium">{uiLang === "zh" ? "生成的提示" : "Generated Prompt"}</div>
          <pre className="mt-2 whitespace-pre-wrap text-sm">{prompt}</pre>
        </div>
      )}
    </main>
  );
}



"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { apiEndpoints } from "@/data/api-endpoints";
import type { ApiEndpointDefinition } from "@/data/types";
import { FileJson, Send } from "lucide-react";
import { useState } from "react";

type JsonValue =
  string | number | boolean | null | { readonly [key: string]: JsonValue } | readonly JsonValue[];

interface ApiResponseState {
  readonly status: number;
  readonly statusText: string;
  readonly durationMs: number;
  readonly contentType: string;
  readonly body: JsonValue;
}

export function ApiPlayground(): React.ReactElement {
  const [activePath, setActivePath] = useState(apiEndpoints[0]?.path ?? "");
  const [response, setResponse] = useState<ApiResponseState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const endpoint = apiEndpoints.find((item) => item.path === activePath) ?? apiEndpoints[0];

  async function sendRequest(): Promise<void> {
    setIsLoading(true);
    setError(null);
    const startedAt = performance.now();

    try {
      const apiResponse = await fetch(activePath, { headers: { Accept: "application/json" } });
      const body = (await apiResponse.json()) as JsonValue;
      setResponse({
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        durationMs: Math.round(performance.now() - startedAt),
        contentType: apiResponse.headers.get("content-type") ?? "application/json",
        body
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!endpoint) {
    return (
      <Panel className="p-5">
        <p>No API endpoints configured.</p>
      </Panel>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Panel className="p-4">
        <p className="mono px-1 py-2 text-sm text-[#55d7ff]">api.workflow.demo</p>
        <h1 className="px-1 pb-4 text-2xl font-semibold">API Playground</h1>
        <div className="space-y-2">
          {apiEndpoints.map((item) => (
            <EndpointButton
              key={item.path}
              endpoint={item}
              isActive={activePath === item.path}
              onSelect={() => {
                setActivePath(item.path);
                setResponse(null);
                setError(null);
              }}
            />
          ))}
        </div>
      </Panel>

      <div className="grid gap-5">
        <Panel className="p-5 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mono text-sm text-[#55d7ff]">REQUEST</p>
              <h2 className="mt-2 text-2xl font-semibold">{endpoint.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#8a96a8]">{endpoint.description}</p>
            </div>
            <Button
              variant="primary"
              icon={<Send aria-hidden="true" size={17} />}
              onClick={sendRequest}
              disabled={isLoading}
            >
              {isLoading ? "Sending" : "Send"}
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <RequestFact label="Method" value={endpoint.method} tone="info" />
            <RequestFact label="Endpoint" value={endpoint.path} />
            <RequestFact label="Accept" value="application/json" />
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel className="p-5">
            <div className="flex items-start gap-3">
              <FileJson aria-hidden="true" className="mt-1 text-[#55d7ff]" size={18} />
              <div>
                <p className="mono text-sm text-[#55d7ff]">API CONTRACT</p>
                <h2 className="mt-2 text-xl font-semibold">Expected Response Shape</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              {endpoint.responseShape.map((field) => (
                <div
                  key={field}
                  className="mono border border-[var(--border)] bg-[#0b0f16] p-3 text-sm text-[#c8d4e6]"
                >
                  {field}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {endpoint.relatedSkills.map((skill) => (
                <Badge key={skill} tone="info">
                  {skill}
                </Badge>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mono text-sm text-[#55d7ff]">RESPONSE</p>
                <h2 className="mt-2 text-xl font-semibold">Route Handler Result</h2>
              </div>
              <Badge tone={error ? "danger" : response ? "success" : "neutral"}>
                {error ? "request failed" : response ? "received" : "idle"}
              </Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ResponseFact
                label="Status"
                value={
                  response
                    ? `${response.status} ${response.statusText || "OK"}`
                    : error
                      ? "failed"
                      : "idle"
                }
                tone={
                  response && response.status >= 200 && response.status < 300
                    ? "success"
                    : "neutral"
                }
              />
              <ResponseFact label="Duration" value={response ? `${response.durationMs} ms` : "-"} />
              <ResponseFact
                label="Content-Type"
                value={response ? response.contentType.split(";")[0] : "-"}
              />
            </div>

            <pre
              aria-label="API response body"
              className="mono mt-5 min-h-[360px] overflow-auto border border-[var(--border)] bg-[#0b0f16] p-4 text-sm leading-6 text-[#c8d4e6]"
            >
              {error ??
                (response ? JSON.stringify(response.body, null, 2) : "// Response appears here")}
            </pre>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function EndpointButton({
  endpoint,
  isActive,
  onSelect
}: Readonly<{
  endpoint: ApiEndpointDefinition;
  isActive: boolean;
  onSelect: () => void;
}>): React.ReactElement {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      className={`w-full border p-4 text-left transition ${
        isActive
          ? "border-[#55d7ff]/60 bg-[#55d7ff]/12"
          : "border-[var(--border)] bg-[#10141d] hover:border-[#55d7ff]/50"
      }`}
    >
      <span className="mono block text-sm text-[#55d7ff]">
        {endpoint.method} {endpoint.path}
      </span>
      <span className="mt-2 block font-semibold">{endpoint.title}</span>
      <span className="mt-1 block text-xs text-[#8a96a8]">{endpoint.description}</span>
    </button>
  );
}

function RequestFact({
  label,
  value,
  tone = "neutral"
}: Readonly<{
  label: string;
  value: string;
  tone?: "neutral" | "info";
}>): React.ReactElement {
  return (
    <section className="border border-[var(--border)] bg-[#10141d] p-4">
      <p className="text-sm text-[#8a96a8]">{label}</p>
      <p
        className={`mono mt-2 text-sm font-semibold ${tone === "info" ? "text-[#55d7ff]" : "text-[#eef5ff]"}`}
      >
        {value}
      </p>
    </section>
  );
}

function ResponseFact({
  label,
  value,
  tone = "neutral"
}: Readonly<{
  label: string;
  value: string;
  tone?: "neutral" | "success";
}>): React.ReactElement {
  return (
    <section className="border border-[var(--border)] bg-[#10141d] p-4">
      <p className="text-sm text-[#8a96a8]">{label}</p>
      <p
        className={`mono mt-2 text-sm font-semibold ${tone === "success" ? "text-[#6ee7a8]" : "text-[#eef5ff]"}`}
      >
        {value}
      </p>
    </section>
  );
}

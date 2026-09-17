import { withActivity } from './activity';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api').replace(
  /\/$/,
  '',
);

type ApiEnvelope<T> = {
  data: T;
};

type ApiErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function requestJson<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {},
): Promise<T> {
  const { accessToken, headers, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });
  const text = await response.text();
  const json = text ? (JSON.parse(text) as ApiEnvelope<T> & ApiErrorEnvelope) : undefined;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      json?.error?.code ?? 'API_ERROR',
      json?.error?.message ?? 'Request failed.',
    );
  }

  return json?.data as T;
}

async function requestBlob(
  path: string,
  options: RequestInit & { accessToken?: string } = {},
): Promise<{ blob: Blob; fileName: string }> {
  const { accessToken, headers, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/pdf',
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let message = 'Request failed.';
    try {
      const json = (await response.json()) as ApiErrorEnvelope;
      message = json.error?.message ?? message;
    } catch {
      // PDF endpoints may return non-JSON errors from infrastructure.
    }
    throw new ApiError(response.status, 'API_ERROR', message);
  }

  const disposition = response.headers.get('content-disposition') ?? '';
  const match = /filename="([^"]+)"/.exec(disposition);
  return {
    blob: await response.blob(),
    fileName: match?.[1] ?? 'timesheet-report.pdf',
  };
}

export function apiRequest<T>(path: string, options: RequestInit & { accessToken?: string } = {}): Promise<T> {
  return withActivity(() => requestJson<T>(path, options));
}

export function apiBlob(path: string, options: RequestInit & { accessToken?: string } = {}): Promise<{ blob: Blob; fileName: string }> {
  return withActivity(() => requestBlob(path, options));
}

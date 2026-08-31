import type { Request } from 'express';

export type RequestWithId = Request & {
  id?: string;
};

export function getRequestId(request: RequestWithId): string {
  const header = request.headers['x-request-id'];
  const headerRequestId = Array.isArray(header) ? header[0] : header;

  return request.id ?? headerRequestId ?? 'unknown';
}

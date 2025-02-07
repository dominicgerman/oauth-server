import { Request, Response } from "express";
import { CLIENTS } from "./config";

const authCodes = new Map<string, string>(); // Temporary store for auth codes

export function authorize(req: Request, res: Response): void {
  const { response_type, client_id, redirect_uri, state } = req.query;

  if (response_type !== "code") {
    res.status(400).json({ error: "unsupported_response_type" });
    return;
  }

  const client = CLIENTS.find((c) => c.client_id === client_id);
  if (!client || client.redirect_uri !== redirect_uri) {
    res.status(400).json({ error: "invalid_client" });
    return;
  }

  const authCode = Math.random().toString(36).substring(7);
  authCodes.set(authCode, client_id as string);

  let redirectURL = `${redirect_uri}?code=${authCode}`;
  if (state) {
    redirectURL += `&state=${state}`;
  }

  res.redirect(302, redirectURL);
}

export function validateAuthCode(code: string, client_id: string): boolean {
  return authCodes.has(code) && authCodes.get(code) === client_id;
}

export function consumeAuthCode(code: string): void {
  authCodes.delete(code);
}

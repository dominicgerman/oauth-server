import { Request, Response } from "express";
import { SignJWT } from "jose";
import { CLIENTS, JWT_SECRET, TOKEN_EXPIRY } from "./config";
import { validateAuthCode, consumeAuthCode } from "./auth";

export async function token(req: Request, res: Response): Promise<void> {
    const { grant_type, code, client_id, redirect_uri } = req.body;

    if (grant_type !== "authorization_code") {
        res.status(400).json({ error: "unsupported_grant_type" });
        return;
    }

    const client = CLIENTS.find((c) => c.client_id === client_id);
    if (!client || client.redirect_uri !== redirect_uri) {
        res.status(400).json({ error: "invalid_client" });
        return;
    }

    if (!validateAuthCode(code, client_id)) {
        res.status(400).json({ error: "invalid_grant" });
        return;
    }

    consumeAuthCode(code);

    const accessToken = await new SignJWT({ client_id })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(TOKEN_EXPIRY)
        .sign(new TextEncoder().encode(JWT_SECRET));

    const responseData = {
        access_token: accessToken,
        token_type: "bearer",
        expires_in: TOKEN_EXPIRY,
    };

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(responseData, null, 2) + "\n");  // I hate unformatted JSON
};



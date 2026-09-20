"use client";

import { createAuthClient } from "better-auth/react";

// Same origin as the app, so no baseURL: the client calls /api/auth/*.
export const authClient = createAuthClient();

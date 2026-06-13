import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { google } from "googleapis";

async function refreshGoogleAccessToken(token: JWT): Promise<JWT> {
  try {
    const refreshToken =
      typeof token.refreshToken === "string" ? token.refreshToken : undefined;

    if (!refreshToken) {
      throw new Error("No Google refresh token is available.");
    }

    const oauthClient = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauthClient.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauthClient.refreshAccessToken();

    return {
      ...token,
      accessToken: credentials.access_token,
      accessTokenExpires: credentials.expiry_date ?? Date.now() + 60 * 60 * 1000,
      refreshToken: credentials.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error("Unable to refresh Google access token:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.accessTokenExpires =
          typeof account.expires_at === "number"
            ? account.expires_at * 1000
            : Date.now() + 60 * 60 * 1000;
        token.refreshToken = account.refresh_token;
        return token;
      }

      const accessTokenExpires =
        typeof token.accessTokenExpires === "number"
          ? token.accessTokenExpires
          : 0;

      if (Date.now() < accessTokenExpires - 60_000) {
        return token;
      }

      if (!token.refreshToken) {
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }

      return refreshGoogleAccessToken(token);
    },
    async session({ session, token }) {
      const googleSession = session as typeof session & {
        accessToken?: unknown;
        error?: unknown;
      };

      googleSession.accessToken = token.accessToken;
      googleSession.error = token.error;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

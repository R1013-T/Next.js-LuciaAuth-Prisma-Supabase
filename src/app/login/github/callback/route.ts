import { github, lucia } from "~/libs/auth";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { db } from "~/libs/db";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = cookies().get("github_oauth_state")?.value ?? null;

    if (!code || !state || !storedState || state !== storedState) {
      console.error("Invalid OAuth state or code", {
        code,
        state,
        storedState,
      });
      return new Response(null, { status: 400 });
    }

    const tokens = await github.validateAuthorizationCode(code);
    console.log("GitHub tokens obtained successfully");

    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (!githubUserResponse.ok) {
      console.error(
        "Failed to fetch GitHub user data",
        await githubUserResponse.text()
      );
      return new Response(null, { status: 500 });
    }

    const githubUser: GitHubUser = await githubUserResponse.json();
    console.log("GitHub user data fetched", {
      id: githubUser.id,
      login: githubUser.login,
    });

    const existingUser = await db.user.findUnique({
      where: { githubId: githubUser.id.toString() },
    });

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
      console.log("Existing user found", { userId });
    } else {
      userId = generateIdFromEntropySize(10);
      await db.user.create({
        data: {
          id: userId,
          githubId: githubUser.id.toString(),
          username: githubUser.login,
        },
      });
      console.log("New user created", { userId });
    }

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    console.log("Session created and cookie set");

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (e) {
    console.error("Error in OAuth callback handler", e);
    if (e instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 });
    }
    if (e instanceof Error) {
      console.error(e.message);
      // PrismaやLuciaのエラーをここで処理できます
    }
    return new Response(null, { status: 500 });
  }
}

interface GitHubUser {
  id: string;
  login: string;
}

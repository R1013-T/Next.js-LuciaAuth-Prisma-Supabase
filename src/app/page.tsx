import { lucia, validateRequest } from "~/libs/auth";
import DocumentLinkList from "./components/document-link/list";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header>Next.js 15 RC + Lucia Auth + Prisma + Supabase</header>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1>Hi, {user.username}!</h1>
        <form action={logout}>
          <button>Sign out</button>
        </form>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <DocumentLinkList />
      </footer>
    </div>
  );
}

async function logout(): Promise<ActionResult> {
  "use server";
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect("/login");
}

interface ActionResult {
  error: string | null;
}

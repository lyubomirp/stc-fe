import LoginForm from "@/app/components/auth/LoginForm";

// Deliberately not in TopNav's TABS: reachable, but not advertised.
export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  // Only same-site paths: taking an arbitrary ?next= would make this an open
  // redirect, handing an attacker a login link that lands on their page.
  const raw = searchParams.next ?? "/";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

  return <LoginForm next={next} />;
}

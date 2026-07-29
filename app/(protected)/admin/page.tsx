import UserAdmin from "@/app/components/auth/UserAdmin";

// Not in TopNav's TABS either. The API is the real gate: GET/POST /users are
// admin-only, so a non-admin who guesses this URL gets the "admins only" panel
// and no data.
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <UserAdmin />;
}

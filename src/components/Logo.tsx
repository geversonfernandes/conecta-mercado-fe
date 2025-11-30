import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Logo() {
  const { user } = useAuth();

  const homePath =
    user?.role === "vendedor"
      ? "/vendedor/dashboard"
      : "/produtos";

  return (
    <Link
      to={homePath}
      className="flex items-center gap-2 font-bold text-xl text-foreground"
    >
      <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary shadow-md" />
      <span>Marketplace</span>
    </Link>
  );
}

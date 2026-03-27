import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { User, Zap } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export default function Header() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: isAdmin } = useIsAdmin();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-xs">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-primary"
            data-ocid="header.link"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            FinFlow
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a
              href="/#how-it-works"
              className="hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              How It Works
            </a>
            <a
              href="/#features"
              className="hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              Loan Products
            </a>
            <a
              href="/#eligibility"
              className="hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              Eligibility
            </a>
            <a
              href="/#faq"
              className="hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              CIBIL Check
            </a>
            {isLoggedIn && (
              <Link
                to="/my-applications"
                className="hover:text-primary transition-colors"
                data-ocid="nav.link"
              >
                My Applications
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="hover:text-primary transition-colors"
                data-ocid="nav.admin.link"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link to="/my-applications">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-primary text-primary hover:bg-secondary gap-2"
                    data-ocid="header.primary_button"
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="text-muted-foreground"
                  data-ocid="header.secondary_button"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="sm"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                data-ocid="header.primary_button"
              >
                <User className="w-4 h-4" />
                {isLoggingIn ? "Connecting..." : "My Account"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

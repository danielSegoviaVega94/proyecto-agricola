import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
  requiresAuth?: boolean;
};

const items: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/perfil", label: "Yo", requiresAuth: true },
];

const bottomItems: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Buscar" },
  { href: "/perfil", label: "Yo", requiresAuth: true },
];

type MainNavProps = {
  currentPath?: string;
  isAuthenticated?: boolean;
};

function isActive(currentPath: string | undefined, href: string) {
  if (!currentPath) {
    return false;
  }
  if (href === "/") {
    return currentPath === "/";
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function MainNavTop({ currentPath, isAuthenticated = false }: MainNavProps) {
  const visible = items.filter((item) => !item.requiresAuth || isAuthenticated);

  return (
    <header className="sticky top-0 z-20 hidden border-b border-[#f0eee8] bg-white/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-[#115e2c]">
          Tierra
        </Link>
        <nav className="flex items-center gap-1">
          {visible.map((item) => {
            const active = isActive(currentPath, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  active
                    ? "bg-[#e8f5ee] text-[#115e2c]"
                    : "text-[#4a4a4a] hover:bg-[#f0eee8] hover:text-[#0f0f0f]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {isAuthenticated ? (
          <span className="w-24" />
        ) : (
          <Link
            href="/login"
            className="rounded-xl border border-[#e8e6e0] px-4 py-2 text-sm font-medium text-[#115e2c] hover:bg-[#e8f5ee]"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}

export function MainNavBottom({ currentPath, isAuthenticated = false }: MainNavProps) {
  const visible = bottomItems.filter((item) => !item.requiresAuth || isAuthenticated);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex h-16 w-full max-w-[420px] border-t border-[#f0eee8] bg-white md:hidden">
      {visible.map((item) => {
        const active = isActive(currentPath, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center text-xs font-medium ${
              active ? "text-[#16803c]" : "text-[#8a8a8a]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

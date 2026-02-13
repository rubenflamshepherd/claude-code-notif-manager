import { Navbar, NavbarSection, NavbarLabel } from '../catalyst/navbar';
import { SidebarLayout } from '../catalyst/sidebar-layout';

export default function AppShell({ sidebar, title, subtitle, children, contentClassName = '' }) {
  return (
    <div className="dark h-screen text-zinc-100">
      <SidebarLayout
        navbar={(
          <Navbar>
            <NavbarSection>
              <div className="min-w-0">
                <NavbarLabel>{title}</NavbarLabel>
                {subtitle ? <p className="truncate text-xs text-zinc-500">{subtitle}</p> : null}
              </div>
            </NavbarSection>
          </Navbar>
        )}
        sidebar={<div className="h-full bg-zinc-900 ring-1 ring-white/10">{sidebar}</div>}
      >
        <main className={`min-h-0 ${contentClassName}`}>{children}</main>
      </SidebarLayout>
    </div>
  );
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Users,
  Building2,
  Settings,
  BarChart3,
  FileText,
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
  managerOnly?: boolean
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { isAdmin, isManager } = useAuth()

  const basePath = isAdmin ? '/admin' : '/manager'

  const navItems: NavItem[] = [
    {
      label: 'Tableau de bord',
      href: `${basePath}/dashboard`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: 'Mes demandes',
      href: `${basePath}/requests`,
      icon: <ClipboardList className="h-5 w-5" />,
      managerOnly: true,
    },
    {
      label: 'Mes immeubles',
      href: '/manager/buildings',
      icon: <Building2 className="h-5 w-5" />,
      managerOnly: true,
    },
    {
      label: 'Nouvelle demande',
      href: '/manager/requests/new',
      icon: <PlusCircle className="h-5 w-5" />,
      managerOnly: true,
    },
    {
      label: 'Toutes les demandes',
      href: '/admin/requests',
      icon: <ClipboardList className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      label: 'Gestionnaires',
      href: '/admin/managers',
      icon: <Users className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      label: 'Immeubles',
      href: '/admin/buildings',
      icon: <Building2 className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      label: 'Rapports',
      href: '/admin/reports',
      icon: <BarChart3 className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      label: 'Documents',
      href: `${basePath}/documents`,
      icon: <FileText className="h-5 w-5" />,
    },
  ]

  // Filtrer les items selon le rôle
  const filteredItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false
    if (item.managerOnly && !isManager) return false
    return true
  })

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r bg-white transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex h-full flex-col p-4">
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-mrbrico-orange/10 text-mrbrico-orange'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Paramètres en bas */}
          <div className="mt-auto pt-4 border-t">
            <Link
              href={`${basePath}/settings`}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname.includes('/settings')
                  ? 'bg-mrbrico-orange/10 text-mrbrico-orange'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Settings className="h-5 w-5" />
              Paramètres
            </Link>
          </div>
        </nav>
      </aside>
    </>
  )
}

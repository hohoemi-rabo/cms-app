'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  UserPlus,
  FileUp,
  FileDown,
  Menu,
  FileText,
  Receipt,
  Package
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigationItems = [
  {
    label: 'ダッシュボード',
    href: '/',
    icon: Home
  },
  {
    label: '顧客管理',
    href: '/customers',
    icon: Users,
    children: [
      {
        label: '顧客一覧',
        href: '/customers',
        icon: Users
      },
      {
        label: '顧客登録',
        href: '/customers/new',
        icon: UserPlus
      },
      {
        label: 'インポート',
        href: '/customers/import',
        icon: FileUp
      },
      {
        label: 'エクスポート',
        href: '/customers/export',
        icon: FileDown
      }
    ]
  },
  {
    label: '請求管理',
    href: '/invoices',
    icon: Receipt,
    children: [
      {
        label: '請求書一覧',
        href: '/invoices',
        icon: FileText
      },
      {
        label: '商品マスタ',
        href: '/products',
        icon: Package
      }
    ]
  }
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
                          (item.href !== '/' && pathname.startsWith(item.href))
          
          // シンプルな表示（子要素があっても親のリンクを表示）
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">メニュー</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px]">
            <SheetHeader>
              <SheetTitle>メニュー</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-4 mt-6">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                                (item.href !== '/' && pathname.startsWith(item.href))
                
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => !item.children && setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 text-sm font-medium transition-colors hover:text-primary py-2',
                        isActive 
                          ? 'text-foreground' 
                          : 'text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                    {/* 子要素がある場合は表示 */}
                    {item.children && (
                      <div className="ml-6 mt-2 space-y-2">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon
                          const isChildActive = pathname === child.href
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                'flex items-center gap-2 text-sm transition-colors hover:text-primary py-1',
                                isChildActive 
                                  ? 'text-foreground' 
                                  : 'text-muted-foreground'
                              )}
                            >
                              <ChildIcon className="h-3 w-3" />
                              {child.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
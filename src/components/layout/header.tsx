import Link from 'next/link'
import { Navigation } from './navigation'
import { Building2 } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">顧客管理システム</span>
          </Link>

          {/* Navigation */}
          <Navigation />

          {/* Future: User menu will go here in Phase 2 */}
        </div>
      </div>
    </header>
  )
}
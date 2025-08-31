import { memo } from 'react'
import { Link, NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { ModeToggle } from '@/components/mode-toggle'

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return clsx('transition-colors hover:text-foreground/80 text-sm', isActive ? 'text-foreground' : 'text-foreground/60')
}

const Header = memo(() => {
  const { t } = useTranslation()
  return (
    <header className="h-[64px] flex items-center justify-between border-b">
      <div className="flex items-center space-x-6">
        <Link to="/" className="ml-9 pr-2">
          <div className="flex items-center">
            <span className="font-bold">CNC Regex</span>
          </div>
        </Link>
        <NavLink
          to="/"
          className={navLinkClassName}
        >
          {t('Home')}
        </NavLink>
        <NavLink
          to="/samples"
          className={navLinkClassName}
        >
          {t('Samples')}
        </NavLink>
      </div>
      <div className="flex items-center text-sm mr-9 space-x-2">
        <ModeToggle />
      </div>
    </header>
  )
})

export default Header

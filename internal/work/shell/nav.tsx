import { type Member, useMember, useSignOut } from '@internal/work/features/auth'
import { prefetchPage } from '@internal/work/features/catalog'
import { PaletteHint } from '@internal/work/shell/command-palette'
import { navStyles as styles } from '@internal/work/shell/nav.stylex'
import {
  accountItems,
  dockItems,
  isNavActive,
  type NavItem,
  railItems,
} from '@internal/work/shell/nav-items'
import { openPalette } from '@internal/work/shell/palette-state'
import { useSidebarChrome } from '@internal/work/shell/sidebar-chrome'
import * as stylex from '@stylexjs/stylex'
import type { ReactElement, ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { playSound, setSoundOn, useSoundOn } from '@/lib/interaction-sounds'
import { sizeTransition } from '@/lib/size-transition.stylex'
import { Avatar } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { FluidHoverHighlight } from '@/ui/fluid-hover-highlight'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { Menu, MenuItem, MenuSeparator } from '@/ui/menu'
import { Pressable } from '@/ui/pressable'
import { SearchGlyph } from '@/ui/search-field'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'

const settingsPath = '/settings'

function Tip({ show, label, children }: { show: boolean; label: string; children: ReactElement }) {
  return (
    <Tooltip disabled={!show}>
      <TooltipTrigger
        render={<span {...stylex.props(styles.tipAnchor, !show && styles.tipAnchorStart)} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

type Enter = number | null

const enterStyles = (enter: Enter) =>
  enter === null ? null : [styles.enter, styles.enterAt(enter)]

function RailLabel({
  collapsed,
  group = false,
  children,
}: {
  collapsed: boolean
  group?: boolean
  children: ReactNode
}) {
  return (
    <span
      aria-hidden={collapsed || undefined}
      {...stylex.props(styles.itemLabel, group && styles.labelGroup, collapsed && styles.hidden)}
    >
      {children}
    </span>
  )
}

function BrandLink({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      to="/"
      aria-label="The Hack Collective home"
      {...stylex.props(styles.brand, collapsed && styles.brandCollapsed)}
    >
      <img
        src="/brand/icon.svg"
        alt=""
        width={256}
        height={256}
        {...stylex.props(styles.brandMark)}
      />
      <RailLabel collapsed={collapsed}>The Hack Collective</RailLabel>
    </Link>
  )
}

function NavLink({
  item,
  collapsed,
  enter = null,
  place = 'rail',
}: {
  item: NavItem
  collapsed: boolean
  enter?: Enter
  place?: 'rail' | 'account'
}) {
  const { pathname } = useLocation()
  const active = isNavActive(item, pathname)
  const rail = place === 'rail'
  return (
    <Tip show={collapsed} label={item.label}>
      <Link
        to={item.to}
        aria-current={active ? 'page' : undefined}
        aria-label={collapsed ? item.label : undefined}
        onMouseEnter={() => prefetchPage(item.to)}
        onFocus={() => prefetchPage(item.to)}
        {...(rail ? { 'data-fluid-item': true } : {})}
        {...stylex.props(
          styles.railItem,
          rail ? styles.glideItem : styles.accountItem,
          active && styles.active,
          enterStyles(enter),
        )}
      >
        <Icon icon={item.icon} size="lg" />
        <RailLabel collapsed={collapsed}>{item.label}</RailLabel>
      </Link>
    </Tip>
  )
}

function soundLabel(sound: boolean) {
  return sound ? 'Mute click sounds' : 'Turn on click sounds'
}

function toggleSound(sound: boolean) {
  setSoundOn(!sound)
  if (!sound) playSound('click')
}

function SoundToggle() {
  const sound = useSoundOn()
  const label = soundLabel(sound)
  return (
    <Tooltip>
      <TooltipTrigger render={<span {...stylex.props(styles.actionAnchor)} />}>
        <Button
          variant="quiet"
          size="iconTouch"
          aria-label={label}
          pressed={sound}
          pressedAppearance="plain"
          data-sidebar-sound-toggle
          onClick={() => toggleSound(sound)}
        >
          <Icon icon={sound ? icons.soundOn : icons.soundOff} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

function SignOutButton() {
  const signOut = useSignOut()
  return (
    <Tooltip>
      <TooltipTrigger render={<span {...stylex.props(styles.actionAnchor)} />}>
        <Button variant="quiet" size="iconTouch" aria-label="Sign out" onClick={signOut}>
          <Icon icon={icons.signOut} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">Sign out</TooltipContent>
    </Tooltip>
  )
}

function ProfileRow({ member, collapsed }: { member: Member; collapsed: boolean }) {
  const { pathname } = useLocation()
  return (
    <Tip show={collapsed} label={member.name}>
      <Link
        to={settingsPath}
        aria-label={`${member.name}, settings`}
        aria-current={pathname === settingsPath ? 'page' : undefined}
        {...stylex.props(
          styles.railItem,
          styles.accountItem,
          styles.profile,
          collapsed && styles.profileCollapsed,
        )}
      >
        <Avatar name={member.name} src={member.imageUrl} size={24} decorative />
        <RailLabel collapsed={collapsed}>
          <span {...stylex.props(styles.truncate)}>{member.name}</span>
        </RailLabel>
      </Link>
    </Tip>
  )
}

function SidebarSearch({ collapsed }: { collapsed: boolean }) {
  return (
    <Tip show={collapsed} label="Search">
      <Pressable
        surface="row"
        aria-label="Search pages and commands"
        aria-keyshortcuts="/ Meta+K Control+K"
        onClick={openPalette}
        style={[styles.railItem, styles.search, collapsed && styles.railItemIcon]}
      >
        <SearchGlyph size="lg" />
        <RailLabel collapsed={collapsed} group>
          <span {...stylex.props(styles.truncate)}>Search</span>
          <PaletteHint />
        </RailLabel>
      </Pressable>
    </Tip>
  )
}

export function Sidebar({ collapsed, canCollapse }: { collapsed: boolean; canCollapse: boolean }) {
  const member = useMember()
  const chrome = useSidebarChrome(collapsed)
  const first: Enter = chrome.stagger ? 0 : null
  return (
    <aside
      data-slot="property-nav"
      data-variant={collapsed ? 'icons' : 'rail'}
      {...chrome.aside}
      {...stylex.props(
        styles.rail,
        chrome.animate && sizeTransition.width,
        collapsed && styles.railIcons,
      )}
    >
      <div {...stylex.props(styles.brandAndSearch, collapsed && styles.brandAndSearchCollapsed)}>
        <div {...stylex.props(styles.brandRow, collapsed && styles.brandRowCollapsed)}>
          <BrandLink collapsed={collapsed} />
          {canCollapse && (
            <Pressable
              surface="row"
              aria-label={collapsed ? 'Expand the sidebar' : 'Collapse the sidebar'}
              aria-expanded={!collapsed}
              onClick={chrome.toggle}
              style={[styles.railItem, styles.railItemIcon]}
            >
              <Icon icon={collapsed ? icons.expandSidebar : icons.collapseSidebar} size="lg" />
            </Pressable>
          )}
        </div>
        <SidebarSearch collapsed={collapsed} />
      </div>
      <nav aria-label="Main" {...chrome.nav} {...stylex.props(styles.navScroll)}>
        <FluidHoverHighlight {...chrome.highlight} />
        <div {...stylex.props(styles.navGroup)}>
          {railItems.map((item, index) => (
            <NavLink
              key={item.id}
              item={item}
              collapsed={collapsed}
              enter={first === null ? null : first + index}
            />
          ))}
        </div>
      </nav>
      <div role="group" aria-label="Account" {...stylex.props(styles.accountBlock)}>
        <div {...stylex.props(styles.accountLinks)}>
          {accountItems.map((item) => (
            <NavLink key={item.id} item={item} collapsed={collapsed} place="account" />
          ))}
        </div>
        <div {...stylex.props(styles.accountRow, collapsed && styles.accountRowCollapsed)}>
          {member !== null && <ProfileRow member={member} collapsed={collapsed} />}
          <SoundToggle />
          <SignOutButton />
        </div>
      </div>
    </aside>
  )
}

function NavMenuItems({ items }: { items: readonly NavItem[] }) {
  const { pathname } = useLocation()
  return items.map((item) => (
    <MenuItem
      key={item.id}
      icon={<Icon icon={item.icon} size="lg" />}
      selected={isNavActive(item, pathname)}
      current={isNavActive(item, pathname)}
      to={item.to}
    >
      {item.label}
    </MenuItem>
  ))
}

export function PhoneHeader() {
  const member = useMember()
  const signOut = useSignOut()
  const sound = useSoundOn()
  return (
    <header data-slot="phone-header" {...stylex.props(styles.phoneHeader)}>
      <span {...stylex.props(styles.truncate, styles.phoneBrand)}>
        <BrandLink collapsed={false} />
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search pages and commands"
        onClick={openPalette}
      >
        <SearchGlyph />
      </Button>
      <Menu
        side="bottom"
        align="end"
        trigger={
          <Button variant="ghost" size="icon" aria-label="Menu">
            <Icon icon={icons.menu} />
          </Button>
        }
      >
        <NavMenuItems items={railItems} />
        <MenuSeparator />
        <NavMenuItems items={accountItems} />
        {member !== null && (
          <MenuItem
            icon={<Avatar name={member.name} src={member.imageUrl} size={24} decorative />}
            to={settingsPath}
          >
            {member.name}
          </MenuItem>
        )}
        <MenuItem
          icon={<Icon icon={sound ? icons.soundOn : icons.soundOff} size="lg" />}
          onClick={() => toggleSound(sound)}
        >
          {soundLabel(sound)}
        </MenuItem>
        <MenuItem icon={<Icon icon={icons.signOut} size="lg" />} onClick={signOut}>
          Sign out
        </MenuItem>
      </Menu>
    </header>
  )
}

export function PhoneDock() {
  const { pathname } = useLocation()
  return (
    <nav
      aria-label="Main"
      data-slot="property-nav"
      data-variant="bar"
      {...stylex.props(styles.tabBar)}
    >
      {dockItems.map((item) => {
        const active = isNavActive(item, pathname)
        return (
          <Link
            key={item.id}
            to={item.to}
            aria-current={active ? 'page' : undefined}
            onMouseEnter={() => prefetchPage(item.to)}
            onFocus={() => prefetchPage(item.to)}
            {...stylex.props(styles.tabItem, active && styles.tabItemActive)}
          >
            <Icon icon={item.icon} size="lg" />
            <span {...stylex.props(styles.tabLabel)}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

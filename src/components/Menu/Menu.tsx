import { MegaMenu } from '../MegaMenu/MegaMenu';
import type { Menu as MenuType } from './MenuSchema';
import { Text } from '../global/matic-ds';
import { useMegaMenuContext } from '../../contexts/MegaMenuContext';

interface MenuProps {
  menu: MenuType;
  variant?: 'default' | 'overflow';
}

export function Menu({ menu, variant = 'default' }: MenuProps) {
  const { itemsCollection } = menu;
  const menuItems = itemsCollection?.items ?? [];
  const { setMegaMenuOpen } = useMegaMenuContext();

  return (
    <div className="group/navbar">
      <div className="flex gap-[0.75rem]">
        {menuItems.map((item) => {
          // TypeScript now properly discriminates based on __typename
          if (item.__typename === 'MegaMenu') {
            // MegaMenu will lazy load its own items
            return (
              <MegaMenu
                key={item.sys.id}
                megaMenuId={item.sys.id}
                title={item.title}
                overflow={variant === 'overflow' ? true : item.overflow}
              />
            );
          } else {
            // Simple link for MenuItem - just show the title as a link
            const linkUrl = item.internalLink ? `/${item.internalLink.slug}` : item.externalLink;
            const linkTarget = item.externalLink ? '_blank' : '_self';
            const linkRel = item.externalLink ? 'noopener noreferrer' : undefined;

            return (
              <a
                key={item.sys.id}
                href={linkUrl}
                target={linkTarget}
                rel={linkRel}
                className="cursor-pointer px-[0.75rem] py-[0.38rem]"
                onMouseEnter={() => setMegaMenuOpen(false)}
              >
                <Text className="text-white">{item.text}</Text>
              </a>
            );
          }
        })}
      </div>
    </div>
  );
}

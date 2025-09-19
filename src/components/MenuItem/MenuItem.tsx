import Image from 'next/image';
import type { MenuItem as MenuItemType } from './MenuItemSchema';

interface MenuItemProps {
  menuItem: MenuItemType;
}

export function MenuItem({ menuItem }: MenuItemProps) {
  const { title, text, description, icon } = menuItem;

  // Determine the link URL and target
  const linkUrl = menuItem.internalLink ? `/${menuItem.internalLink.slug}` : menuItem.externalLink ?? '#';
  const linkTarget = menuItem.externalLink ? '_blank' : '_self';
  const linkRel = menuItem.externalLink ? 'noopener noreferrer' : undefined;

  const content = (
    <div className="cursor-pointer min-w-[17.9rem] hover:bg-[#FFFFFF14] p-[0.75rem] w-fit flex flex-col gap-[0.5rem]">
      {icon && (
        <div className="bg-white w-fit p-[0.25rem]">
            <Image
            src={icon.url} 
            alt={icon.title ?? title}
            width={icon.width ?? 100}
            height={icon.height ?? 100}
            className="brightness-0 w-[1rem] h-[1rem]"
            />
        </div>
      )}
      <div className="flex flex-col gap-[0.25rem]">
        <p className="text-white text-[0.875rem] leading-[120%]">{text}</p>
        <p className="text-[#D4D4D4] text-[0.6875rem] leading-[140%] whitespace-pre-line">{description}</p>
      </div>
    </div>
  );

  // If there's a link, wrap in anchor tag
  if (linkUrl) {
    return (
      <a 
        href={linkUrl}
        target={linkTarget}
        rel={linkRel}
      >
        {content}
      </a>
    );
  }

  // Otherwise, just return the content
  return content;
}
// import { formatDate } from '@/lib/utils'; // Unused import

import type { AgendaItem as AgendaItemType } from '@/components/AgendaItem/AgendaItemSchema';

interface AgendaItemProps {
  agendaItem: AgendaItemType;
  className?: string;
}

export function AgendaItem({ agendaItem, className = '' }: AgendaItemProps) {
  // Custom time formatting: 8:30am = 8h30, 1pm = 13h00
  const formatAgendaTime = (timeString: string): string => {
    const date = new Date(timeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Format minutes as "00" if zero, otherwise show actual minutes
    const formattedMinutes = minutes === 0 ? '00' : minutes.toString().padStart(2, '0');
    
    return `${hours}h${formattedMinutes}`;
  };
  
  const formattedTime = formatAgendaTime(agendaItem.time);

  return (
    <div className={`${className}`}>
      <div className="flex">
        <div className="flex-grow px-[1rem] py-[0.88rem]">
          <time className="text-[1rem] font-normal leading-[160%] tracking-[0.01rem]" dateTime={agendaItem.time}>
            {formattedTime}
          </time>
        </div>
        <div className="flex-grow bg-subtle flex items-center px-[1rem] py-[0.88rem]">
          <h3 className="text-[1rem] text-text-body font-normal leading-[160%] tracking-[0.01rem]">
            {agendaItem.description}
          </h3>
        </div>
      </div>
    </div>
  );
}

interface AgendaListProps {
  agendaItems: AgendaItemType[];
  className?: string;
}

export function AgendaList({ agendaItems, className = '' }: AgendaListProps) {
  if (!agendaItems.length) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground">No agenda items available.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-0 ${className}`}>
      {agendaItems.map((item) => (
        <AgendaItem key={item.sys.id} agendaItem={item} />
      ))}
    </div>
  );
}

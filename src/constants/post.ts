export const categoryColorMap = (category: string) => {
  switch (category) {
    case 'Press Release':
      return 'text-[#1975FF]';
    case 'Blog':
      return 'text-[#BBDEFB]';
    case 'Case Study':
      return 'text-[#C8E6C9]';
    case 'Data Sheet':
      return 'text-[#D1C4E9]';
    case 'Featured':
      return 'text-[#FFF9C4]';
    case 'In The News':
      return 'text-[#1975FF]';
    case 'Resources':
      return 'text-[#FFE0B2]';
    case 'Shug Speaks':
      return 'text-[#F8BBD0]';
    case 'Video':
      return 'text-[#D7CCC8]';
    default:
      return 'text-gray-400';
  }
};

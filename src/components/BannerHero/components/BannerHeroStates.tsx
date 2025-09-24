import { BannerHeroSkeleton } from '@/components/BannerHero/components/BannerHeroSkeleton';

/**
 * Pure presentation components for BannerHero states
 * Handle only UI rendering for different states
 */

export const LoadingState = () => <BannerHeroSkeleton />;

export const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center p-4">
    <div className="text-lg text-red-500">{message}</div>
  </div>
);

export const EmptyState = () => (
  <div className="flex items-center justify-center p-4">
    <div className="text-lg">No BannerHero found</div>
  </div>
);

'use client';

import { useEffect, useState } from 'react';
import { Container } from '../global/matic-ds';
import { AirImage } from '../Image/AirImage';
import type { Image as ImageType } from '../Image/ImageSchema';
import { Button } from '../ui/button';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import Image from 'next/image';
import Link from 'next/link';

import { formatDate, formatDateRange } from '@/lib/utils';

import { AgendaList } from '@/components/AgendaItem/AgendaItem';
import { ContactCard } from '@/components/ContactCard/ContactCard';
import { getPostsByCategories } from '@/components/Event/EventApi';
import { DynamicHubspotForm as HubspotForm } from '@/components/Forms/DynamicContactForm';
import { ImageBetweenWrapper } from '@/components/ImageBetween/ImageBetweenWrapper';
import { Location } from '@/components/OfficeLocation/OfficeLocation';
import { PageLayout } from '@/components/PageLayout/PageLayout';
import { RichTextRenderer } from '@/components/Post/components/RichTextRenderer';
import { getAllPostsMinimal } from '@/components/Post/PostApi';
import { PostCard } from '@/components/Post/PostCard';
import { PostCardSkeleton } from '@/components/Post/PostCardSkeleton';
import { Slider } from '@/components/Slider/Slider';

import type { Event } from '@/components/Event/EventSchema';
import type { Footer } from '@/components/Footer/FooterSchema';
import type { Header } from '@/components/Header/HeaderSchema';
import type { Post } from '@/components/Post/PostSchema';

interface EventDetailWithLayoutProps {
  event: Event;
  header?: Header | null;
  footer?: Footer | null;
}

// News Posts Component
function NewsPosts() {
  const [newsPosts, setNewsPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsPosts = async () => {
      try {
        setLoading(true);
        // Get all posts with minimal fields to avoid complexity issues
        const allPosts = await getAllPostsMinimal();

        // Filter for "Press Release" or "In The News" categories (using correct enum values)
        const newsPosts = allPosts.items
          .filter((post) =>
            post.categories?.some(
              (category) => category === 'Press Release' || category === 'In The News'
            )
          )
          .slice(0, 3); // Take only first 3

        setNewsPosts(newsPosts);
      } catch {
        setNewsPosts([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchNewsPosts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (newsPosts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {newsPosts.map((post) => (
        <PostCard key={post.sys.id} {...post} />
      ))}
    </div>
  );
}

// Event Post Categories Component
interface EventPostCategoriesProps {
  categories: string[];
  maxPostsPerCategory: number;
  title?: string;
  description?: string;
}

function EventPostCategories({
  categories,
  maxPostsPerCategory,
  title,
  description
}: EventPostCategoriesProps) {
  const [postsByCategory, setPostsByCategory] = useState<Record<string, Post[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostsByCategories = async () => {
      try {
        setLoading(true);
        const posts = await getPostsByCategories(categories, maxPostsPerCategory);
        setPostsByCategory(posts);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0) {
      void fetchPostsByCategories();
    } else {
      setLoading(false);
    }
  }, [categories, maxPostsPerCategory]);

  if (loading) {
    return (
      <div>
        {/* Section Header */}
        {(title ?? description) && (
          <div className="mb-12">
            {title && <h2 className="text-[3rem] font-normal leading-[120%] mb-4">{title}</h2>}
            {description && <p className="text-lg text-gray-600">{description}</p>}
          </div>
        )}

        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-[2rem] font-normal leading-[120%] mb-6">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: Math.min(maxPostsPerCategory, 3) }).map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter out categories with no posts using secure property access
  const categoriesWithPosts = categories.filter((category) => {
    if (Object.prototype.hasOwnProperty.call(postsByCategory, category)) {
      const propertyDescriptor = Object.getOwnPropertyDescriptor(postsByCategory, category);
      const posts = propertyDescriptor?.value as Post[] | undefined;
      return posts && Array.isArray(posts) && posts.length > 0;
    }
    return false;
  });

  if (categoriesWithPosts.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Section Header */}
      {(title ?? description) && (
        <div className="mb-12">
          {title && <h2 className="text-[3rem] font-normal leading-[120%] mb-4">{title}</h2>}
          {description && <p className="text-lg text-gray-600">{description}</p>}
        </div>
      )}

      <div className="space-y-12">
        {categoriesWithPosts.map((category) => (
          <div key={category}>
            <h3 className="text-[2rem] font-normal leading-[120%] mb-6">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(() => {
                if (Object.prototype.hasOwnProperty.call(postsByCategory, category)) {
                  const propertyDescriptor = Object.getOwnPropertyDescriptor(
                    postsByCategory,
                    category
                  );
                  const posts = propertyDescriptor?.value as Post[] | undefined;
                  return posts && Array.isArray(posts)
                    ? posts.map((post: Post) => (
                        <PostCard key={post.sys.id} {...post} />
                      ))
                    : null;
                }
                return null;
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventDetail({
  event: initialEvent,
  header = null,
  footer = null
}: EventDetailWithLayoutProps) {
  // Contentful Live Preview integration
  const event = useContentfulLiveUpdates(initialEvent);
  const inspectorProps = useContentfulInspectorMode({ entryId: event?.sys?.id });

  const _formattedDateTime = formatDateRange(event.dateTime, event.endDateTime ?? undefined, true);

  // Format date and time separately for two-line display
  const formattedDate = formatDate(event.dateTime ?? '', false); // Just the date
  const formatTimeRange = (startDateString: string, endDateString?: string): string => {
    const startDate = new Date(startDateString);
    const startTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Check if endDateString exists and is not empty
    if (!endDateString || endDateString.trim() === '') {
      // If no end time, include timezone on start time
      const startTimeWithTz = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });
      return `from ${startTimeWithTz}`;
    }

    const endDate = new Date(endDateString);

    // Check if the end date is valid
    if (isNaN(endDate.getTime())) {
      const startTimeWithTz = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });
      return `from ${startTimeWithTz}`;
    }

    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });

    return `from ${startTime} to ${endTime}`;
  };

  const formattedTimeRange = formatTimeRange(event.dateTime, event.endDateTime);

  // Event data processing

  // Render based on template type
  switch (event.template as string) {
    case 'Agenda':
      return (
        <PageLayout header={header} footer={footer}>
          <div className="h-[28.64rem] flex flex-col mb-[3rem] relative overflow-hidden">
            {/* Background Image */}
            {event.bannerImage?.link ? (
              <AirImage
                link={event.bannerImage.link}
                altText={event.bannerImage.altText ?? event.bannerImage.title ?? 'Event banner'}
                className="w-full h-full absolute inset-0 z-0 object-cover"
              />
            ) : (
              <div className="w-full h-full absolute inset-0 z-0 bg-blue-500" />
            )}

            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 z-10 bg-black/30" />

            {/* Content */}
            <Container className="flex-grow flex flex-col pb-[3rem] relative z-20">
              <div className="flex-grow flex flex-col justify-end">
                <h1
                  className="text-[3.75rem] text-white font-normal tracking-[-0.0375rem] leading-[120%] drop-shadow-lg"
                  {...inspectorProps({ fieldId: 'title' })}
                >
                  {event.title ?? ''}
                </h1>
                <h2 className="text-[3.75rem] text-white font-normal tracking-[-0.0375rem] leading-[120%] drop-shadow-lg">
                  Nextracker Agenda
                </h2>
              </div>
            </Container>
          </div>
          <Container>
            {/* Event Header */}
            <div className="flex flex-col md:flex-row gap-[1.25rem] mb-[4rem] z-10">
              {/* Date & Time */}
              <div className="bg-subtle items-start flex-grow p-[2.5rem] min-h-[13.1875rem] md:items-center flex gap-[1.25rem]">
                {event.dateIcon && (
                  <div className="bg-black p-[0.58rem] h-fit">
                    <Image
                      src={event.dateIcon.url ?? ''}
                      alt={event.dateIcon.description ?? 'Date icon'}
                      width={event.dateIcon.width ?? 24}
                      height={event.dateIcon.height ?? 24}
                      className=""
                    />
                  </div>
                )}
                <div className="flex flex-col gap-[0.5rem]">
                  <time
                    className="text-4xl font-normal leading-[120%]"
                    dateTime={event.dateTime ?? ''}
                    {...inspectorProps({ fieldId: 'dateTime' })}
                  >
                    {formattedDate}
                  </time>
                  <div 
                    className="text-2xl font-normal leading-[120%]"
                    {...inspectorProps({ fieldId: 'endDateTime' })}
                  >
                    {formattedTimeRange}
                  </div>
                </div>
              </div>

              {/* Address */}
              {event.address && (
                <div className="flex-grow bg-subtle items-start flex md:items-center min-h-[13.1875rem] gap-[1.25rem] p-[2.5rem]">
                  {event.addressIcon && (
                    <div className="bg-black p-[0.58rem] h-fit">
                      <Image
                        src={event.addressIcon.url ?? ''}
                        alt={event.addressIcon.description ?? 'Address icon'}
                        width={event.addressIcon.width ?? 24}
                        height={event.addressIcon.height ?? 24}
                        className=""
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-[0.5rem]">
                    <div 
                      className="text-4xl font-normal leading-[120%]"
                      {...inspectorProps({ fieldId: 'address' })}
                    >
                      {event.address ?? ''}
                    </div>
                    {event.addressSubline && (
                      <div 
                        className="text-2xl font-normal leading-[120%]"
                        {...inspectorProps({ fieldId: 'addressSubline' })}
                      >
                        {event.addressSubline ?? ''}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Agenda Section - Only shown on Agenda template */}
            {event.agendaItemsCollection?.items && event.agendaItemsCollection.items.length > 0 && (
              <div className="mb-[7.5rem]">
                {event.agendaHeadline && (
                  <h2 
                    className="text-[3rem] font-normal tracking-[-0.04rem] leading-[120%]"
                    {...inspectorProps({ fieldId: 'agendaHeadline' })}
                  >
                    {event.agendaHeadline ?? ''}
                  </h2>
                )}

                <AgendaList
                  agendaItems={event.agendaItemsCollection?.items ?? []}
                  className="py-[2rem]"
                />

                {event.agendaFooter && (
                  <p 
                    className="text-[1.25rem] font-normal leading-[120%]"
                    {...inspectorProps({ fieldId: 'agendaFooter' })}
                  >
                    {event.agendaFooter ?? ''}
                  </p>
                )}
              </div>
            )}
          </Container>
        </PageLayout>
      );

    case 'Landing 1':
      return (
        <PageLayout header={header} footer={footer}>
          <ImageBetweenWrapper
            variant="default"
            backgroundImage={
              event.bannerImage?.link
                ? {
                    link: event.bannerImage.link,
                    altText: event.bannerImage.altText ?? event.bannerImage.title ?? 'Event banner'
                  }
                : undefined
            }
            contentTop={
              <Container className="h-[28.64rem] flex flex-col justify-center">
                <h1
                  className="text-[3.75rem] text-white font-normal tracking-[-0.0375rem] leading-[120%] drop-shadow-lg text-left"
                  {...inspectorProps({ fieldId: 'title' })}
                >
                  {event.title ?? ''}
                </h1>
              </Container>
            }
            asset={
              event.mainImage && (
                <div className="w-full">
                  <AirImage
                    link={event.mainImage.link ?? ''}
                    altText={
                      event.mainImage.altText ??
                      event.mainImage.title ??
                      'Event main image'
                    }
                    className="w-full max-h-[33.75rem] object-cover"
                  />
                  {/* Main Image Caption directly under the image */}
                  {event.mainImageCaption && (
                    <p 
                      className=" text-gray-600 mt-4 px-4"
                      {...inspectorProps({ fieldId: 'mainImageCaption' })}
                    >
                      {event.mainImageCaption}
                    </p>
                  )}
                </div>
              )
            }
            contentBottom={<div></div>}
          />

          {/* Section Heading Content - After ImageBetweenWrapper */}
          <Container className="py-[10rem]">
            <div className="flex flex-col md:flex-row gap-[2.5rem] items-end">
              {/* Left side - Title and Description */}
              <div className="flex-1">
                {/* Section Heading Title */}
                {event.sectionHeadingTitle && (
                  <h2 
                    className="text-[3rem] font-normal leading-[120%] mb-4"
                    {...inspectorProps({ fieldId: 'sectionHeadingTitle' })}
                  >
                    {event.sectionHeadingTitle}
                  </h2>
                )}

                {/* Section Heading Description */}
                {event.sectionHeadingDescription && (
                  <p 
                    className="text-lg text-gray-600"
                    {...inspectorProps({ fieldId: 'sectionHeadingDescription' })}
                  >
                    {event.sectionHeadingDescription}
                  </p>
                )}
              </div>

              {/* Right side - Button */}
              {event.sectionHeadingButton && (
                <div className="flex-shrink-0">
                  {event.sectionHeadingButton.internalLink ? (
                    <Link href={`/${event.sectionHeadingButton.internalLink.slug}`}>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        {event.sectionHeadingButton.text}
                      </Button>
                    </Link>
                  ) : event.sectionHeadingButton.externalLink ? (
                    <a
                      href={event.sectionHeadingButton.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        {event.sectionHeadingButton.text}
                      </Button>
                    </a>
                  ) : (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      {event.sectionHeadingButton.text}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Landing 1 Asset */}
            {event.landing1Asset && (
              <div 
                className="flex justify-center mt-8"
                {...inspectorProps({ fieldId: 'landing1Asset' })}
              >
                {event.landing1Asset.__typename === 'Image' ? (
                  <AirImage
                    link={(event.landing1Asset as ImageType).link ?? ''}
                    altText={
                      (event.landing1Asset as ImageType).altText ??
                      (event.landing1Asset as ImageType).title ??
                      'Event asset'
                    }
                    className="w-full h-auto"
                  />
                ) : event.landing1Asset.__typename === 'Video' ? (
                  <div className="w-full max-w-[68rem]">test</div>
                ) : null}
              </div>
            )}

            {/* In the News Section */}
            <div className="mt-[6rem]" {...inspectorProps({ fieldId: 'content' })}>
              <h2 className="text-[3rem] font-normal leading-[120%] mb-8">In the News</h2>
              <NewsPosts />
            </div>

            {/* Slider */}
            {event.slider && (
              <div className="mt-[6rem]">
                <Slider {...event.slider} />
              </div>
            )}

            {/* Event Post Categories */}
            {event.postCategories && event.postCategories.length > 0 && (
              <div className="mt-[6rem]">
                <EventPostCategories
                  categories={event.postCategories}
                  maxPostsPerCategory={event.maxPostsPerCategory ?? 3}
                  title="Downloads"
                  description="Please browse and download datasheets, case studies, and whitepapers of interest."
                />
              </div>
            )}

            {/* Form CTA */}
            {event.formCta && (
              <div className="mt-[6rem] mb-[6rem]">
                <HubspotForm hubspotForm={event.formCta} theme="light" />
              </div>
            )}
          </Container>
        </PageLayout>
      );

    case 'Landing 2':
      return (
        <PageLayout header={header} footer={footer}>
          <div className="h-[28.64rem] flex flex-col mb-[3rem] relative overflow-hidden">
            {/* Background Image */}
            {event.bannerImage?.link ? (
              <AirImage
                link={event.bannerImage.link}
                altText={event.bannerImage.altText ?? event.bannerImage.title ?? 'Event banner'}
                className="w-full h-full absolute inset-0 z-0 object-cover"
              />
            ) : (
              <div className="w-full h-full absolute inset-0 z-0 bg-blue-500" />
            )}

            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 z-10 bg-black/30" />

            {/* Content */}
            <Container className="flex-grow flex flex-col pb-[3rem] relative z-20">
              <div className="flex-grow flex flex-col justify-end">
                <h1
                  className="text-[3.75rem] text-white font-normal tracking-[-0.0375rem] leading-[120%] drop-shadow-lg"
                  {...inspectorProps({ fieldId: 'title' })}
                >
                  {event.title ?? ''}
                </h1>
              </div>
            </Container>
          </div>
          <Container className="gap-[6rem] flex flex-col">
            <div>
              {event.mainImage && (
                <div className="w-full">
                  {event.mainImage.__typename === 'Image' ? (
                    <AirImage
                      link={event.mainImage.link ?? ''}
                      altText={
                        event.mainImage.altText ?? event.mainImage?.title ?? 'Event asset'
                      }
                      className="w-full h-auto"
                    />
                  ) : event.mainImage.__typename === 'Video' ? (
                    <div>video</div>
                  ) : null}
                </div>
              )}

              <div className="flex flex-wrap items-end gap-[2rem] justify-between">
                {event.mainImageCaption && (
                  <p 
                    className="mt-4 text-gray-600 max-w-[68rem]"
                    {...inspectorProps({ fieldId: 'mainImageCaption' })}
                  >
                    {event.mainImageCaption}
                  </p>
                )}

                {event.sectionHeadingButton && (
                  <div className="mt-6">
                    {event.sectionHeadingButton.internalLink ? (
                      <Link href={`/${event.sectionHeadingButton.internalLink.slug}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          {event.sectionHeadingButton.text}
                        </Button>
                      </Link>
                    ) : event.sectionHeadingButton.externalLink ? (
                      <a
                        href={event.sectionHeadingButton.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          {event.sectionHeadingButton.text}
                        </Button>
                      </a>
                    ) : (
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        {event.sectionHeadingButton.text}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            { }
            {(event.sectionRichContent || event.landing1Asset) && (
              <div className="flex flex-col md:flex-row gap-8 mt-8">
                {/* Rich Content Section */}
                {event.sectionRichContent && (
                  <div 
                    className="flex-1"
                    {...inspectorProps({ fieldId: 'sectionRichContent' })}
                  >
                    <RichTextRenderer content={event.sectionRichContent} />
                  </div>
                )}

                {/* Landing Asset Section */}
                {event.landing1Asset && (
                  <div 
                    className="flex-1"
                    {...inspectorProps({ fieldId: 'landing1Asset' })}
                  >
                    {event.landing1Asset.__typename === 'Image' ? (
                      <AirImage
                        link={(event.landing1Asset as ImageType).link ?? ''}
                        altText={
                          (event.landing1Asset as ImageType).altText ??
                          (event.landing1Asset as ImageType).title ??
                          'Event asset'
                        }
                        className="w-full h-auto"
                      />
                    ) : event.landing1Asset.__typename === 'Video' ? (
                      <div>video</div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            <div className="mt-12" {...inspectorProps({ fieldId: 'content' })}>
              <h2 className="text-[3rem] font-normal leading-[120%] mb-8">In the News</h2>
              <NewsPosts />
            </div>

            {/* Slider */}
            {event.slider && (
              <div className="mt-[6rem]">
                <Slider {...event.slider} />
              </div>
            )}

            {/* Form CTA */}
            {event.formCta && (
              <div className="mt-[6rem] mb-[6rem]">
                <HubspotForm hubspotForm={event.formCta} theme="light" />
              </div>
            )}
          </Container>
        </PageLayout>
      );

    case 'Landing 3':
      return (
        <PageLayout header={header} footer={footer}>
          <ImageBetweenWrapper
            variant="default"
            backgroundImage={
              event.bannerImage?.link
                ? {
                    link: event.bannerImage.link,
                    altText: event.bannerImage.altText ?? event.bannerImage.title ?? 'Event banner'
                  }
                : undefined
            }
            contentTop={
              <Container className="h-[40.75rem] flex flex-col justify-center">
                <h1 className="text-display-md" {...inspectorProps({ fieldId: 'title' })}>
                  {event.title ?? ''}
                </h1>
              </Container>
            }
            asset={
              event.mainImage && (
                <div className="w-full">
                  <AirImage
                    link={event.mainImage.link ?? ''}
                    altText={
                      event.mainImage.altText ??
                      event.mainImage.title ??
                      'Event main image'
                    }
                    className="w-full max-h-[33.75rem] object-cover"
                  />
                  {/* Main Image Caption directly under the image */}
                  {event.mainImageCaption && (
                    <p 
                      className=" text-gray-600 mt-4 px-4"
                      {...inspectorProps({ fieldId: 'mainImageCaption' })}
                    >
                      {event.mainImageCaption}
                    </p>
                  )}
                </div>
              )
            }
            contentBottom={<div></div>}
          />

          {/* Section Heading Content - After ImageBetweenWrapper */}
          <Container className="py-[10rem]">
            <div className="flex flex-col md:flex-row gap-[2.5rem] items-end">
              {/* Left side - Title and Description */}
              <div className="flex-1">
                {/* Section Heading Title */}
                {event.sectionHeadingTitle && (
                  <h2 
                    className="text-[3rem] font-normal leading-[120%] mb-4"
                    {...inspectorProps({ fieldId: 'sectionHeadingTitle' })}
                  >
                    {event.sectionHeadingTitle}
                  </h2>
                )}

                {/* Section Heading Description */}
                {event.sectionHeadingDescription && (
                  <p 
                    className="text-lg text-gray-600"
                    {...inspectorProps({ fieldId: 'sectionHeadingDescription' })}
                  >
                    {event.sectionHeadingDescription}
                  </p>
                )}
              </div>

              {/* Right side - Button */}
              {event.sectionHeadingButton && (
                <div className="flex-shrink-0">
                  {event.sectionHeadingButton.internalLink ? (
                    <Link href={`/${event.sectionHeadingButton.internalLink.slug}`}>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        {event.sectionHeadingButton.text}
                      </Button>
                    </Link>
                  ) : event.sectionHeadingButton.externalLink ? (
                    <a
                      href={event.sectionHeadingButton.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        {event.sectionHeadingButton.text}
                      </Button>
                    </a>
                  ) : (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      {event.sectionHeadingButton.text}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Landing 1 Asset */}
            {event.landing1Asset && (
              <div 
                className="flex justify-center mt-8"
                {...inspectorProps({ fieldId: 'landing1Asset' })}
              >
                {event.landing1Asset.__typename === 'Image' ? (
                  <AirImage
                    link={(event.landing1Asset as ImageType).link ?? ''}
                    altText={
                      (event.landing1Asset as ImageType).altText ??
                      (event.landing1Asset as ImageType).title ??
                      'Event asset'
                    }
                    className="w-full h-auto"
                  />
                ) : event.landing1Asset.__typename === 'Video' ? (
                  <div className="w-full max-w-[68rem]">test</div>
                ) : null}
              </div>
            )}

            {/* Referenced Posts Section */}
            {event.referencedPostsCollection?.items &&
              event.referencedPostsCollection.items.length > 0 && (
                <div
                  className="mt-[6rem]"
                  {...inspectorProps({ fieldId: 'referencedPostsCollection' })}
                >
                  <div className="space-y-6">
                    {event.referencedPostsCollection.items.map((post, index) => (
                      <div
                        key={post.sys.id}
                        className={`flex flex-col md:flex-row gap-6 md:h-[34.125rem] ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                      >
                        {/* Main Image */}
                        {post.mainImage && (
                          <div className="flex-grow">
                            <div className="w-full overflow-hidden h-64 md:h-full max-h-[34.125rem]">
                              <AirImage
                                link={post.mainImage.link ?? ''}
                                altText={
                                  post.mainImage.altText ?? post.mainImage.title ?? post.title
                                }
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-shrink-0 md:w-[30rem] space-y-3 bg-subtle p-[2.5rem] flex flex-col justify-between">
                          {/* Title */}
                          <h3
                            className="leading-[130%]"
                            style={{ fontSize: '1.75rem', fontStyle: 'normal', fontWeight: 400 }}
                          >
                            {post.title}
                          </h3>

                          {/* Divider */}
                          <div className="h-px w-full bg-border"></div>

                          {/* Excerpt */}
                          {post.excerpt && (
                            <p className="text-body-sm text-text-subtle leading-relaxed">
                              {post.excerpt}
                            </p>
                          )}

                          {/* Button */}
                          <div className="pt-3">
                            <Link href={`/posts/${post.slug}`}>
                              <Button>Read More</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Contact Section */}
            {(event.contactHeadline ??
              event.officeLocation ??
              (event.contactCardsCollection?.items &&
                event.contactCardsCollection.items.length > 0)) && (
              <div className="mt-[6rem]">
                {/* Contact Headline */}
                {event.contactHeadline && (
                  <h2 className="text-[3rem] font-normal leading-[120%] mb-8">
                    {event.contactHeadline}
                  </h2>
                )}

                {/* Office Location */}
                {event.officeLocation && (
                  <div className="mb-8">
                    <Location {...event.officeLocation} variant="featured" />
                  </div>
                )}

                {/* Contact Cards */}
                {event.contactCardsCollection?.items &&
                  event.contactCardsCollection.items.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {event.contactCardsCollection.items.map((contactCard) => (
                        <div
                          key={contactCard.sys.id}
                          className="[&_.bg-subtle]:!bg-white [&_.bg-subtle]:!text-black [&_button]:!bg-white [&_button]:!text-black [&_button]:!border-gray-300 [&_button:hover]:!bg-gray-50"
                        >
                          <ContactCard contactCardId={contactCard.sys.id} />
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {/* Form CTA */}
            {event.formCta && (
              <div className="mt-[6rem] mb-[6rem]">
                <HubspotForm hubspotForm={event.formCta} theme="light" />
              </div>
            )}
          </Container>
        </PageLayout>
      );

    default:
      // Fallback to Landing 1 if template is not recognized
      return (
        <PageLayout header={header} footer={footer}>
          <Container>
            <h1 className="text-[3.75rem] font-normal tracking-[-0.0375rem] leading-[120%] mb-8">
              {event.title ?? ''}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Unknown template: {event.template ?? 'undefined'}
            </p>

            {/* Basic event info as fallback */}
            <div className="bg-subtle p-[2.5rem] mb-8">
              <time
                className="text-2xl font-normal leading-[120%] block mb-2"
                dateTime={event.dateTime ?? ''}
              >
                {formattedDate}
              </time>
              <div className="text-lg font-normal leading-[120%]">{formattedTimeRange}</div>
            </div>
          </Container>
        </PageLayout>
      );
  }
}

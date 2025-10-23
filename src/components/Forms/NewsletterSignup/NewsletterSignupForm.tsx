import { Box, Container } from '@/components/global/matic-ds';

import { HubspotForm } from '@/components/Forms/HubspotForm/HubspotForm';
import { AirImage } from '@/components/Image/AirImage';

import type { NewsletterSignup } from '@/components/Forms/NewsletterSignup/NewsletterSignupSchema';

interface NewsletterSignupFormProps {
  data: NewsletterSignup;
  image?: {
    link?: string;
    altText?: string;
    title?: string;
  };
}

export function NewsletterSignupForm({ data, image }: NewsletterSignupFormProps) {
  return (
    <div className="relative w-full h-[40rem] lg:h-[17rem]">
      {image?.link && (
        <AirImage
          link={image.link}
          altText={image.altText}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <Container className="relative h-full w-full">
        <Box direction="col" gap={4} className="justify-center h-full w-full">
          <h2 className="text-text-on-invert text-headline-md">{data.title}</h2>
          <p className="text-text-on-invert text-body-xs">{data.description}</p>
          <HubspotForm formId={data.formId} className="w-full h-auto" />
        </Box>
      </Container>
    </div>
  );
}

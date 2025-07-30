'use client';

/** Contact form component with real-time validation
 * Features:
 * - Real-time field validation using Zod
 * - Accessible form controls with ARIA attributes
 * - Loading and error states
 * - Toast notifications for form submission feedback
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useForm, type AnyFieldApi } from '@tanstack/react-form';
import { z } from 'zod';

import { useToast } from '@/hooks/use-toast';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Loader2 } from 'lucide-react';

/** Props for form field components */
interface FormFieldProps {
  /** Label text displayed above the input */
  label: string;
  /** Field name corresponding to form data structure */
  name: keyof ContactFormData;
  /** Placeholder text for the input */
  placeholder: string;
  /** Type of form control to render */
  component?: 'input' | 'textarea';
}

/** Displays validation state and error messages for a form field */
function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <div data-testid={`${field.name}-field-info`}>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em className="text-destructive text-sm">{field.state.meta.errors.join(',')}</em>
      ) : null}
      {field.state.meta.isValidating ? (
        <em className="text-primary text-sm">Validating...</em>
      ) : null}
    </div>
  );
}

/** Zod schema for form validation with custom error messages */
const contactSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
    .max(100, 'Email cannot exceed 100 characters')
    .transform((email) => email.toLowerCase()),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters long')
    .max(1000, 'Message cannot exceed 1000 characters')
    .refine((val) => !val.includes('<script>'), {
      message: 'Message contains invalid characters'
    })
});

/** Type definition for form data based on Zod schema */
type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Contact form component with real-time validation and submission handling
 * Uses @tanstack/react-form for form state management and Zod for validation
 */
export function ContactForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      message: ''
    },
    onSubmit: async ({ value }) => {
      console.log('Form submitted:', value);
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        // Simulate API call - replace with actual API endpoint
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push('/contact/success');
      } catch (error) {
        console.log('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  /**
   * Renders a form field with label, input/textarea, and validation feedback
   */
  function FormField({ label, name, placeholder, component = 'input' }: FormFieldProps) {
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <form.Field
          name={name}
          validators={{
            onChange: ({ value }) => {
              try {
                // Use the appropriate schema validator based on the field name
                if (name === 'firstName') {
                  contactSchema.shape.firstName.parse(value);
                } else if (name === 'lastName') {
                  contactSchema.shape.lastName.parse(value);
                } else if (name === 'email') {
                  contactSchema.shape.email.parse(value);
                } else if (name === 'message') {
                  contactSchema.shape.message.parse(value);
                }
                return undefined;
              } catch (error) {
                if (error instanceof z.ZodError && error.errors && error.errors.length > 0) {
                  const firstError = error.errors[0];
                  return firstError ? firstError.message : 'Validation error';
                }
                return 'Invalid input';
              }
            }
          }}
        >
          {(field) => (
            <>
              {component === 'input' ? (
                <Input
                  id={name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={placeholder}
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={`${name}-error`}
                />
              ) : (
                <Textarea
                  id={name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={placeholder}
                  className="min-h-[100px]"
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={`${name}-error`}
                />
              )}
              <FieldInfo field={field} />
            </>
          )}
        </form.Field>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>
            Fill out the form below and we&apos;ll get back to you as soon as possible.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* First Name */}
          <FormField label="First Name" name="firstName" placeholder="Your first name" />
          {/* Last Name */}
          <FormField label="Last Name" name="lastName" placeholder="Your last name" />
          {/* Email */}
          <FormField label="Email" name="email" placeholder="your.email@example.com" />
          {/* Message Field */}
          <FormField
            label="Message"
            name="message"
            placeholder="Your message..."
            component="textarea"
          />
        </CardContent>

        <CardFooter>
          <Button
            variant={theme === 'dark' ? 'secondary' : 'default'}
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Sending...</span>
                <Loader2 className="animate-spin" />
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

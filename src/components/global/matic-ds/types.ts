export type ArticleProps = {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  html?: { __html: string };
};

export type BoxProps = {
  children: React.ReactNode;
  className?: string;
  direction?:
    | 'row'
    | 'col'
    | {
        base?: 'row' | 'col';
        sm?: 'row' | 'col';
        md?: 'row' | 'col';
        lg?: 'row' | 'col';
        xl?: 'row' | 'col';
        '2xl'?: 'row' | 'col';
      };
  wrap?:
    | boolean
    | {
        base?: boolean;
        sm?: boolean;
        md?: boolean;
        lg?: boolean;
        xl?: boolean;
        '2xl'?: boolean;
      };
  gap?:
    | number
    | {
        base?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        '2xl'?: number;
      };
  cols?:
    | number
    | {
        base?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        '2xl'?: number;
      };
  rows?:
    | number
    | {
        base?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        '2xl'?: number;
      };
};

export type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  width?: 'boxed' | 'full';
};

export type LayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export type MainProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

type TextVariant = 'display' | 'headline' | 'title' | 'body' | 'label';
type TextSize = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';
export type TextLineHeight = 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose' | number;
type TextLetterSpacing = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';

export type TextAs = keyof JSX.IntrinsicElements;

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  size?: TextSize;
  lineHeight?: TextLineHeight;
  letterSpacing?: TextLetterSpacing;
  as?: TextAs;
}

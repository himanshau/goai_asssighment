import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'elevated' | 'outlined' | 'flat';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

interface CardBodyProps {
    children: ReactNode;
    className?: string;
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

const variantStyles = {
    elevated: 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-xl',
    outlined: 'bg-transparent border-2 border-slate-700',
    flat: 'bg-slate-800/30'
};

const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6'
};

export function Card({
    children,
    className = '',
    variant = 'elevated',
    hover = false,
    padding = 'none'
}: CardProps) {
    return (
        <div
            className={`
        rounded-2xl ${variantStyles[variant]} ${paddingStyles[padding]}
        ${hover ? 'transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-slate-600' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`px-6 py-4 border-b border-slate-700/50 ${className}`}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '' }: CardBodyProps) {
    return (
        <div className={`px-6 py-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`px-6 py-4 border-t border-slate-700/50 ${className}`}>
            {children}
        </div>
    );
}

export default Card;

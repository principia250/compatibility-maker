import Link from "next/link";
import { clsx } from "clsx";
export default function CustomLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
    return (
        <Link 
            href={href} 
            className={clsx("text-primary hover:underline", className)}
        >
            {children}
        </Link>
    );
}
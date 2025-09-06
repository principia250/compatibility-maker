import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-400 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="text-primary hover:underline">
        Go back to home
      </Link>
    </div>
  )
}

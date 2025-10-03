import Link from 'next/link';

export default function PostNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Post Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The post you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="space-y-4">
          <Link
            href="/blog"
            className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            Browse All Posts
          </Link>
          <div>
            <Link
              href="/"
              className="text-primary hover:underline"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

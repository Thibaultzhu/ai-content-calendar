import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          AI Content Calendar
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Create, schedule, and manage your content across multiple platforms
          with AI-powered writing assistance.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

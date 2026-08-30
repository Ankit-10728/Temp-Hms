import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="relative w-full h-screen flex items-center justify-center text-white">

            <div className="absolute inset-0">
                <img
                    src="/pageNotFound.jpg"
                    alt="background"
                    className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/50"></div>
            </div>
            <div className="relative z-10 text-center px-4">
                <p className="text-4xl text-gray-300 mb-4">404</p>

                <h1 className="text-5xl md:text-7xl font-bold mb-4">
                    Page not found
                </h1>

                <p className="text-gray-400 text-lg mb-6">
                    Sorry, we couldn’t find the page you’re looking for.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center text-xl gap-2 text-white hover:text-gray-300 transition"
                >
                    ← Back to home
                </Link>
            </div>
        </div>
    );
}
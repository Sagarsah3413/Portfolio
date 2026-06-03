"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("adminToken", data.token);
                router.push("/admin/dashboard");
            } else {
                setError(data.error || "Invalid password");
            }
        } catch (err) {
            setError("Something went wrong: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                        Admin Login
                    </h1>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Admin Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter admin password"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a
                            href="/"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            ← Back to Portfolio
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

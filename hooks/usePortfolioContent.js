import { useEffect, useState } from "react";

export function usePortfolioContent(section) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch(
                    `/api/content?section=${section}`
                );
                if (response.ok) {
                    const result = await response.json();
                    setData(result.data);
                } else {
                    setError("Failed to fetch content");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [section]);

    return { data, loading, error };
}

import dbConnect from "@/lib/mongodb";
import PortfolioContent from "@/models/PortfolioContent";

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const section = searchParams.get("section");

        if (section) {
            const content = await PortfolioContent.findOne({ section });
            if (!content) {
                return new Response(
                    JSON.stringify({
                        error: `No content found for section: ${section}`,
                    }),
                    { status: 404 }
                );
            }
            return new Response(JSON.stringify(content), { status: 200 });
        } else {
            const allContent = await PortfolioContent.find({});
            return new Response(JSON.stringify(allContent), { status: 200 });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}

export async function PUT(request) {
    try {
        const auth = request.headers.get("authorization");
        if (auth !== "Bearer admin_authenticated") {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
            });
        }

        await dbConnect();

        const { section, data } = await request.json();

        if (!section || !data) {
            return new Response(
                JSON.stringify({ error: "Section and data are required" }),
                { status: 400 }
            );
        }

        const content = await PortfolioContent.findOneAndUpdate(
            { section },
            { data },
            { new: true, upsert: true }
        );

        return new Response(JSON.stringify(content), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}

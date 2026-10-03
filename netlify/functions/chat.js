export default async (req) => {
    try {
        if (req.method !== "POST") {
            return new Response(
                JSON.stringify({ reply: "Method not allowed." }),
                {
                    status: 405,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const data = await req.json();
        const message = (data.message || "").trim();

        if (!message) {
            return new Response(
                JSON.stringify({ reply: "Please type a message." }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-20b",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful AI assistant."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    max_completion_tokens: 1024
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error("Groq error:", result);

            return new Response(
                JSON.stringify({
                    reply: "Sorry, something went wrong with the AI."
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const reply =
            result.choices?.[0]?.message?.content ||
            "I couldn't generate a response.";

        return new Response(
            JSON.stringify({ reply }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );

    } catch (error) {
        console.error("Function error:", error);

        return new Response(
            JSON.stringify({
                reply: "Sorry, something went wrong."
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
};
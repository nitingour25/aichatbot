
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()

app = Flask(__name__)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is not set.")

client = Groq(api_key=api_key)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        message = data.get("message", "").strip()

        if not message:
            return jsonify({"reply": "Please type a message."})

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant."
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            max_completion_tokens=1024
        )

        reply = response.choices[0].message.content

        return jsonify({"reply": reply})

    except Exception as e:
        print("Groq error:", e)
        return jsonify({"reply": "Sorry, something went wrong."}), 500


if __name__ == "__main__":
    app.run(debug=True)
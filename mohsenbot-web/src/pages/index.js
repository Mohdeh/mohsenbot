import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Head from "next/head";

const SYSTEM_MESSAGE =
  "I am Mohsenbot, a versatile AI agent created by Mohsen using state-of-the-art ML models and APIs!";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  // const [botMessage, setBotMessage] = useState("");

  const [messages, setMessages] = useState([
    { role: "system", content: SYSTEM_MESSAGE },
  ]);

  const [userMessage, setUserMessage] = useState("");

  const API_URL = "https://api.openai.com/v1/chat/completions";

  async function sendRequest() {
    // update message history
    const newMessage = { role: "user", content: userMessage };
    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setUserMessage("");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: newMessages,
      }),
    });

    const responseJson = await response.json();
    const newBotMessage = responseJson.choices[0].message;
    const newMessages2 = [...newMessages, newBotMessage];
    setMessages(newMessages2);
    // console.log("responseJson: ", responseJson);

    // // console.log("responsejson: ", responseJson);
    // setBotMessage(responseJson.choices[0].message.content);
    // // console.log("botMessage: ", botMessage);
  }

  return (
    <>
      <Head>
        <title> Mohsenbot - Your friendly AI Companion </title>
      </Head>
      <div className="flex flex-col h-screen">
        {/* Navigation Bar */}
        <nav className="shadow px-4 py-2 flex flex-row justify-between items-center">
          <div className="font-xl font-bold"> Mohsenbot </div>
          <div>
            <input
              type="password"
              className="border p-1 rounded"
              onChange={(e) => setApiKey(e.target.value)}
              value={apiKey}
              placeholder="Paste your API Key here!"
            />
          </div>
        </nav>

        {/* Message History */}
        <div className="flex-1 overflow-y-scroll">
          <div className="w-full max-w-screen-md mx-auto px-4">
            {messages
              .filter((message) => message.role !== "system")
              .map((message, idx) => (
                <div key={idx} className="my-3">
                  <div className="font-bold">
                    {message.role === "user" ? "You" : "Mobot"}
                  </div>
                  <div className="text-lg prose">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Message Input Box */}
        <div>
          <div className="w-full max-w-screen-md mx-auto flex px-4 pb-4">
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="border text-lg rounded-md p-1 flex-1"
              rows={1}
            />
            <button
              onClick={sendRequest}
              className="bg-cyan-200 hover:bg-cyan-400 border rounded-md text-black text-lg w-20 p-1 ml-2"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

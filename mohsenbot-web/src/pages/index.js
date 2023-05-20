import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Head from "next/head";
import { createParser } from "eventsource-parser";
import Navbar from "@/components/Navbar";
import { streamOpenAIResponse } from "@/utils/openai";
import { useUser } from "@supabase/auth-helpers-react";

const SYSTEM_MESSAGE =
  "I am Mohsenbot, a versatile AI agent created by Mohsen using state-of-the-art ML models and APIs!";

export default function Home() {
  // const [apiKey, setApiKey] = useState("");
  // const [botMessage, setBotMessage] = useState("");

  const user = useUser();
  const [messages, setMessages] = useState([
    { role: "system", content: SYSTEM_MESSAGE },
  ]);

  const [userMessage, setUserMessage] = useState("");

  const API_URL = "/api/chat";

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendRequest();
    }
  };

  // message streaming
  const sendRequest = async () => {
    if (!user) {
      alert("Please log in to send a message ...!");
      return;
    }

    if (!userMessage) {
      alert("Please enter a message before clicking send button ...!");
      return;
    }

    const oldUserMessage = userMessage;
    const oldMessages = messages;
    const updatedMessages = [
      ...messages,
      {
        role: "user",
        content: userMessage,
      },
    ];

    setMessages(updatedMessages);
    setUserMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: updatedMessages,
          stream: true,
        }),
      });

      if (response.status !== 200) {
        throw new Error(`OpenAI API returned an error!`);
      }

      streamOpenAIResponse(response, (newMessage) => {
        console.log("newMessage:", newMessage);
        const updatedMessages2 = [
          ...updatedMessages,
          { role: "assistant", content: newMessage },
        ];
        setMessages(updatedMessages2);
      });
    } catch (error) {
      console.error("error");
      setUserMessage(oldUserMessage);
      setMessages(oldMessages);
      window.alert("Error:" + error.message);
    }
  };

  // console.log("responseJson: ", responseJson);

  // // console.log("responsejson: ", responseJson);
  // setBotMessage(responseJson.choices[0].message.content);
  // // console.log("botMessage: ", botMessage);

  return (
    <>
      <Head>
        <title> Mohsenbot - Your friendly AI Companion </title>
      </Head>
      <div className="flex flex-col h-screen">
        {/* Navigation Bar */}
        <Navbar />

        {/* Message History */}
        <div className="flex-1 overflow-y-scroll">
          <div className="w-full max-w-screen-md mx-auto px-4">
            {messages
              .filter((message) => message.role !== "system")
              .map((message, idx, row) => (
                <div key={idx} className="my-3">
                  <div className="font-bold">
                    {message.role === "user" ? "You" : "Mobot"}
                  </div>
                  <div
                    id={idx + 1 === row.length ? "last" : idx}
                    className="text-lg prose"
                  >
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
              onKeyDown={handleKeyDown}
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

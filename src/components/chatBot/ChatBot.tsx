import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./styles.css";
import { IoSendSharp } from "react-icons/io5";
import { FaMicrophone, FaStop } from "react-icons/fa";

// Using placeholder images temporarily
const PLACEHOLDER_ANIMATED = "https://media.giphy.com/media/3oEjI5VtIhHvK37WYo/giphy.gif"; // Animated robot placeholder
const PLACEHOLDER_STATIC = "https://placehold.co/250x250/007bff/ffffff?text=AI+Bot"; // Static robot placeholder

interface Message {
  speaker: string;
  text: string;
  time: string;
  audio: string | null;
}

const ChatBot = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [loader1, setloader1] = useState(false);
  const [loader2, setloader2] = useState(false);
  const [loader3, setloader3] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([
    { speaker: "bot", text: "Hi there! How can I help you today?", time: new Date().toLocaleTimeString(), audio: null },
  ]);
  const [viewMode, setViewMode] = useState("voice");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [message, setMessage] = useState("");
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsBotSpeaking(false);
      setloader2(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.log("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "whisper-1");
    formData.append("language", "en");

    try {
      const response = await axios.post(`${import.meta.env.VITE_OPENAI_URI}`, formData, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        console.log(response.data.text);

        const backendFormData = {
          user_query: response.data.text,
        };

        setloader3(true);
        const backendResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URI}/handle_message`,
          backendFormData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Backend Response:", backendResponse.data.data.queryResponse);
        const transcript = response.data.text;
        addMessage("user", transcript);
        processUserInput(backendResponse.data.data.queryResponse);
      }
    } catch (error) {
      console.log("Error transcribing audio:", error);
      addMessage("bot", "Sorry, I couldn't understand that. Please try again.");
      processUserInput("Sorry, I couldn't understand that. Please try again.");
    }
  };

  const processUserInput = (response: string) => {
    setloader3(false);
    setIsBotSpeaking(true);
    setloader2(true);
    setTimeout(() => {
      addMessage("bot", response);
      speakResponse(response);
    }, 1500);
  };

  const processUserInput2 = (response: string) => {
    setIsBotSpeaking(false);
    setTimeout(() => {
      addMessage("bot", response);
      setloader1(false);
    }, 1500);
  };

  const speakResponse = (text: string) => {
    if (window.speechSynthesis) {
      setloader2(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        setIsBotSpeaking(false);
        setloader2(false);
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const addMessage = (speaker: string, text: string, audio: string | null = null) => {
    setConversationHistory((prev) => [
      ...prev,
      { speaker, text, time: new Date().toLocaleTimeString(), audio },
    ]);
  };

  const sendMessage = async () => {
    if (message.trim() === "") return;
    addMessage("user", message);
    setMessage("");
    setloader1(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URI}/handle_message`,
        { user_query: message },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      processUserInput2(response.data.data.queryResponse);
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  return (
    <div className="voice-text-interface">
      {viewMode === "voice" ? (
        <div className="voice-screen">
          {loader3 ? (
            <div className="loader2"></div>
          ) : loader2 ? (
            <img src={PLACEHOLDER_ANIMATED} width="300" height="300" alt="AI Assistant Speaking" />
          ) : (
            <>
              <img src={PLACEHOLDER_STATIC} width="250" height="250" alt="AI Assistant" />
              <div className="visualizer-container" id="visualizer">
                <div className="visualizer-circle"></div>
                <div className="visualizer-circle"></div>
                <div className="visualizer-circle"></div>
              </div>
            </>
          )}

          <div className="chatbotvoices">
            <p className="speaker-title" style={{ marginTop: "100px" }}>
              {isRecording ? "Listening..." : "Click the microphone to start speaking"}
            </p>
            <div style={{ display: "flex" }}>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`mic-btn ${isRecording ? "listening" : ""}`}
              >
                <FaMicrophone style={{ fontSize: "22px" }} />
              </button>
              {isBotSpeaking && (
                <button onClick={stopSpeaking} className="mic-btn stop">
                  <FaStop style={{ fontSize: "22px" }} />
                </button>
              )}
            </div>
            <button onClick={() => setViewMode("chat")} className="toggle-view-btn">
              View Conversation History
            </button>
          </div>
        </div>
      ) : (
        <div className="chat-screen">
          <div className="header">
            <button onClick={() => setViewMode("voice")} className="back-btn">
              Back to Voice Mode
            </button>
            <div className="header-title">Conversation History</div>
          </div>
          <div className="conversation-container" ref={conversationContainerRef}>
            {conversationHistory.map((msg, index) => (
              <div key={index} className={`message ${msg.speaker}-message`}>
                <div className="message-header">
                  {msg.speaker === "user" ? "You" : "Bot"} • {msg.time}
                </div>
                <div className="message-bubble">{msg.text}</div>
                {msg.audio && <audio controls src={msg.audio}></audio>}
              </div>
            ))}
            {loader1 && <div className="loader"></div>}
          </div>
          <div className="text-input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="text-input"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loader1) {
                  sendMessage();
                }
              }}
            />
            <button onClick={sendMessage} className="send-btn" disabled={loader1}>
              <IoSendSharp style={{ fontSize: "20px" }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot; 
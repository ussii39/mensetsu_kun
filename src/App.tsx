import React, { useState, useEffect, useRef } from "react";
import "./style.css"; // ここでCSSファイルをインポート

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition | undefined;
    webkitSpeechRecognition: typeof SpeechRecognition | undefined;
  }

  const SpeechRecognition: {
    new (): ISpeechRecognition;
  };

  const webkitSpeechRecognition: {
    new (): ISpeechRecognition;
  };
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface Message {
  sender: "user" | "assistant";
  content: string;
}

const professions = [
  "フロントエンドエンジニア",
  "バックエンドエンジニア",
  "クラウドエンジニア",
  "インフラエンジニア",
  "QAエンジニア",
  "組み込み系システムエンジニア",
  "フルスタックエンジニア",
  "データアナリスト",
  "データサイエンティスト",
  "機械学習エンジニア",
  "Webデザイナー",
  "マーケター",
  "営業",
  "プロジェクトマネージャー",
];
const companyScales = [
  "スタートアップ",
  "中小企業",
  "大企業",
  "グローバル企業",
];
const establishmentYears = [
  "1年以内",
  "1-5年",
  "5-10年",
  "10年以上",
  "50年以上",
];
const stockStatuses = ["上場している", "上場していない", "非公開"];
const challenges = [
  "開発速度",
  "根気強さ",
  "市場競争",
  "資金調達",
  "人材確保",
  "イノベーション",
  "技術的負債",
];
const industries = [
  "IT",
  "製造",
  "サービス",
  "金融",
  "医療",
  "教育",
  "エネルギー",
  "不動産",
  "小売",
  "運輸",
];

const educations = ["高卒", "大卒", "修士号", "博士号", "その他"];
const interviewerRoles = [
  "人事部長",
  "チームリーダー",
  "マネージャー",
  "CTO",
  "CEO",
];

const interviewerTypes = ["冷静", "明るい", "温和", "高圧的"];
const interviewStages = ["1次面接", "2次面接", "最終面接"];

const SpeechToText: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState("面接官のターンです。");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [interviewStage, setInterviewStage] = useState("1次面接");
  const [interviewerType, setInterviewerType] = useState("冷静");
  const [interviewerRole, setInterviewerRole] = useState("人事部長");
  const [selectedProfession, setSelectedProfession] = useState(professions[0]);
  const [selectedCompanyScale, setSelectedCompanyScale] = useState(
    companyScales[0]
  );
  const [selectedEstablishmentYear, setSelectedEstablishmentYear] = useState(
    establishmentYears[0]
  );
  const [selectedStockStatus, setSelectedStockStatus] = useState(
    stockStatuses[0]
  );
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState(industries[0]);
  const [companyVision, setCompanyVision] = useState("");
  const [companyProducts, setCompanyProducts] = useState("");
  const [userAge, setUserAge] = useState("");
  const [userPreviousJob, setUserPreviousJob] = useState("");
  const [userEducation, setUserEducation] = useState("大卒");
  const [userRole, setUserRole] = useState("");
  const [userJobChanges, setUserJobChanges] = useState("");
  const [userCurrentIncome, setUserCurrentIncome] = useState("");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const handleCheckboxChange = (challenge: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(challenge)
        ? prev.filter((c) => c !== challenge)
        : [...prev, challenge]
    );
  };

  useEffect(() => {
    const handleResult = (event: SpeechRecognitionEvent) => {
      const newTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setTranscript(newTranscript);

      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        setCountdown(null);
      }

      silenceTimeoutRef.current = setTimeout(() => {
        startCountdown();
      }, 5000); // 5秒の途切れ
      scrollToBottom(); // 自動スクロールを追加
    };

    if (isListening) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "ja-JP";
        recognition.onresult = handleResult;
        recognition.start();

        recognition.onend = () => {
          setIsListening(false);
        };

        return () => {
          console.log(transcript, "終了条件");
          console.log(isListening, "isListening");
          if (transcript === "" && isListening) return;
          console.log("終了");
          recognition.stop();
          recognition.onresult = null;
        };
      }
    } else {
      handleSubmit(transcript, "user");
    }
    console.log(messages, "messages");
    console.log(isListening, "isListening");
  }, [isListening]);

  const startCountdown = () => {
    setCountdown(3);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown !== null && prevCountdown > 1) {
          return prevCountdown - 1;
        } else {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          console.log(transcript, "送信するtranscript");
          handleSubmit(transcript, "user");
          return null;
        }
      });
    }, 1000);
  };

  const handleListen = () => {
    if (!isListening) {
      setStatus("面接官の挨拶中...");
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "assistant",
          content: "こんにちは。面接を始めます。自己紹介をお願いします。",
        },
      ]);
      setStatus("ユーザーのターンです。");
      setIsListening(true);
    }
  };

  const handleSubmit = async (text: string, sender: "user" | "assistant") => {
    console.log(text, "text");
    console.log(transcript, "transcript");
    if (recognitionRef.current && sender === "user") {
      recognitionRef.current.stop();
    }

    if (sender === "user" && text !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender, content: text },
      ]);
      setStatus("面接官の回答待ち...");
      setTranscript("");
    }

    if (transcript === "") return;
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    const messagesForAPI = [
      {
        role: "system",
        content: `You are a helpful assistant acting as an interviewer for a company. This is a ${interviewStage}, and you are expected to behave in a ${interviewerType} manner. The interviewer holds the position of ${interviewerRole}. The company is a ${selectedCompanyScale}, established ${selectedEstablishmentYear}, ${selectedStockStatus}, in the ${selectedIndustry} industry, with the vision of '${companyVision}', and products/services including '${companyProducts}', facing challenges such as ${selectedChallenges.join(
          ", "
        )}. The role in question is for a ${selectedProfession}. The candidate is ${userAge} years old, previously worked as ${userPreviousJob} with the role of ${userRole}, has changed jobs ${userJobChanges} times, and currently earns ${userCurrentIncome}, with the highest education level being ${userEducation}.`,
      },
      ...messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: sender === "user" ? "user" : "assistant", content: text },
    ];
    console.log(messagesForAPI, "messagesForAPI");

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messagesForAPI,
        max_tokens: 150,
        temperature: 0.7,
      }),
    };

    try {
      const response = await fetch(apiUrl, requestOptions);
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const aiResponse = data.choices[0].message.content.trim();
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "assistant", content: aiResponse },
        ]);
        setStatus("ユーザーのターンです。");
        setTranscript("");
        setIsListening(true); // ユーザーのターンが再開
      } else {
        console.error("No choices found in response:", data);
      }
    } catch (error) {
      console.error("Error fetching response from OpenAI:", error);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        if (chatContainerRef.current.scrollTop === 0) {
          // 無限スクロールのロジックを追加
          // ここで過去のメッセージを取得するロジックを実装します。
          console.log("Load more messages");
        }
      }
    };

    if (chatContainerRef.current) {
      chatContainerRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold mb-2">企業の属性</h2>
          <div>
            <label>職業: </label>
            <select
              onChange={(e) => setSelectedProfession(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {professions.map((profession) => (
                <option key={profession} value={profession}>
                  {profession}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>会社の規模: </label>
            <select
              onChange={(e) => setSelectedCompanyScale(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {companyScales.map((scale) => (
                <option key={scale} value={scale}>
                  {scale}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>設立年数: </label>
            <select
              onChange={(e) => setSelectedEstablishmentYear(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {establishmentYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>上場状況: </label>
            <select
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {stockStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>業界: </label>
            <select
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>企業のビジョン: </label>
            <input
              type="text"
              value={companyVision}
              onChange={(e) => setCompanyVision(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>主な製品・サービス: </label>
            <input
              type="text"
              value={companyProducts}
              onChange={(e) => setCompanyProducts(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>課題: </label>
            <div className="flex flex-wrap">
              {challenges.map((challenge) => (
                <div key={challenge} className="mr-4 mb-2 flex items-center">
                  <input
                    type="checkbox"
                    value={challenge}
                    onChange={() => handleCheckboxChange(challenge)}
                    className="mr-2"
                  />
                  <label>{challenge}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label>何次面接: </label>
            <select
              value={interviewStage}
              onChange={(e) => setInterviewStage(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {interviewStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>面接官の性格: </label>
            <select
              value={interviewerType}
              onChange={(e) => setInterviewerType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {interviewerTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>面接官の役職: </label>
            <select
              value={interviewerRole}
              onChange={(e) => setInterviewerRole(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {interviewerRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">ユーザーの属性</h2>
          <div>
            <label>年齢: </label>
            <input
              type="text"
              value={userAge}
              onChange={(e) => setUserAge(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>前職(現職): </label>
            <input
              type="text"
              value={userPreviousJob}
              onChange={(e) => setUserPreviousJob(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>役割: </label>
            <input
              type="text"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>転職回数: </label>
            <input
              type="text"
              value={userJobChanges}
              onChange={(e) => setUserJobChanges(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>現年収: </label>
            <input
              type="text"
              value={userCurrentIncome}
              onChange={(e) => setUserCurrentIncome(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>最終学歴: </label>
            <select
              value={userEducation}
              onChange={(e) => setUserEducation(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {educations.map((education) => (
                <option key={education} value={education}>
                  {education}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleListen}
        className="px-4 py-2 bg-blue-500 text-white rounded"
        disabled={isListening}
      >
        面接開始
      </button>
      <p className="mt-4">ステータス: {status}</p>
      {countdown !== null && (
        <p className="mt-4">
          発言が途切れました。{countdown}秒後に送信します...
        </p>
      )}
      <div
        ref={chatContainerRef}
        className="chat-container"
        style={{ width: "100%", height: "600px", overflowY: "auto" }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.sender === "assistant" ? "assistant" : "user"
            }`}
            style={{
              textAlign: message.sender === "assistant" ? "left" : "right",
              margin: "10px",
              padding: "10px",
              borderRadius: "10px",
              backgroundColor:
                message.sender === "assistant" ? "#e0e0e0" : "#0084ff",
              color: message.sender === "assistant" ? "black" : "white",
              maxWidth: "60%",
              alignSelf:
                message.sender === "assistant" ? "flex-start" : "flex-end",
            }}
          >
            {message.content}
          </div>
        ))}
        {transcript && (
          <div
            className="message user"
            style={{
              textAlign: "right",
              margin: "10px",
              padding: "10px",
              borderRadius: "10px",
              backgroundColor: "#0084ff",
              color: "white",
              maxWidth: "60%",
              alignSelf: "flex-end",
            }}
          >
            {transcript}
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold my-4"></h1>
      <SpeechToText />
    </div>
  );
};

export default App;

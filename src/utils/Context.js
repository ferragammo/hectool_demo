import { createContext, useEffect, useRef, useState } from "react";
import { ChatModelType } from "../static/enums/ChatModelType";
import {
   createMessage,
   getAllChatMessages,
} from "../api/messageApi";
import { createChat, getChatById, getChats } from "../api/chatApi";

export const ContextApp = createContext();

const AppContext = ({ children }) => {
   const [showSlide, setShowSlide] = useState(false);
   const [Mobile, setMobile] = useState(false);
   const [chats, setChats] = useState([]);
   const [chatValue, setChatValue] = useState("");
   const [selectedModel, setSelectedModel] = useState(
      ChatModelType.gpt_4o_mini
   );
   const [message, setMessage] = useState([]);
   const [fileData, setFileData] = useState(null);
   const [isLoading, setIsLoading] = useState(false);

   const [selectedChat, setSelectedChat] = useState(null);
   //'674d7f4eed4768a959ab111c'
   const msgEnd = useRef(null);

   useEffect(() => {
      if (msgEnd.current) {
         msgEnd.current.scrollIntoView({ behavior: "smooth" });
      }
   }, [message]);

   const handleSend = async () => {
      const text = chatValue;
      setChatValue("");
      setIsLoading(true);

      setMessage((prevMessages) => [...prevMessages, { text, isBot: false }]);

      if (!selectedChat) {
         try {
            const newChat = await createChat();
            if (newChat) {
               setSelectedChat(newChat.data.id);
               const responseMessage = await createMessage(
                  newChat.data.id,
                  text
               );
               console.log(responseMessage)
               setMessage((prevMessages) => [
                  ...prevMessages,
                  { text: responseMessage.text, isBot: true },
               ]);
            } else {
               console.error("Failed to create a new chat");
            }
         } catch (error) {
            console.error("Error creating new chat:", error);
         }
         getAllChats();
      } else {
         const responseMessage = await createMessage(selectedChat, text);
         setMessage((prevMessages) => [
            ...prevMessages,
            { text: responseMessage.text, isBot: true },
         ]);
      }
      setIsLoading(false);
   };



   const handleKeyPress = (e) => {
      if (!isLoading) {
         if (e.key === "Enter") {
            if (chatValue.trim() !== "" || fileData) {
               handleSend();
            }
         }
      }
   };

   const loadChatMessages = async (chatId) => {

      if (chatId) {
         const result = await getAllChatMessages(chatId);
         console.log(result);

         if (result.data.length > 0) {
            const formattedMessages = result.data.map((msg) => ({
               text: msg.content,
               isBot: msg.role === "ai",
               file: msg?.fileUrl,
            }));

            setMessage(formattedMessages);
         } else {
            setMessage([]);
         }
      } else {
         setMessage([]);
      }
   };

   const selectedChatById = async (chatId) => {
      try {
    
         const chat = await getChatById(chatId);
         if (chat) {
            setSelectedChat(chatId);
            loadChatMessages(chatId);
         }
      } catch (error) {
         console.error("Error fetching chat by ID:", error.message);
      }
   };

   const getAllChats = async () => {
      try {
        
         const response = await getChats(0, 10);
         if (response.data) {
            setChats(response.data);
         } else {
            console.log(response.error);
         }
      } catch (error) {
         console.log(error.message || "Error creating chat");
      }
   };

   useEffect(() => {
      getAllChats();
   }, []);

   return (
      <ContextApp.Provider
         value={{
            showSlide,
                setShowSlide,
                Mobile,
                setMobile,
                chatValue,
                setChatValue,
                handleSend,
                message,
                setMessage,
                chats,
                msgEnd,
                handleKeyPress,
                loadChatMessages,
                selectedModel,
                setSelectedModel,
                setSelectedChat,
                selectedChat,
                selectedChatById,
                setFileData,
                getAllChats,
                setChats,
                fileData,
                isLoading
         }}
      >
         {children}
      </ContextApp.Provider>
   );
};
export default AppContext;

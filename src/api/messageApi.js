import api from ".";

export const getAllChatMessages = async (chatId) => {
   try {
      const response = await api.get(`/api/agent/${chatId}/all`, {});

      if (response.data.successful) {
         const result = response.data.data;
         return result;
      } else {
         throw new Error(response.data.error);
      }
   } catch (error) {
      console.error("Error getting messages: ", error);
      return error;
   }
};

// export const createMessage = async (chatId, text) => {
//    try {
//       const response = await api.post(`/api/agent/${chatId}`, { text });

//       if (response.data.successful) {
//          const result = response.data.data;
//          return result;
//       } else {
//          throw new Error(response.data.error);
//       }
//    } catch (error) {
//       console.error("Error getting messages: ", error);
//       return error;
//    }
// };


export const createMessage = async (chatId, text, onChunk) => {
   const url = `${process.env.REACT_APP_DEV_API_URL}/api/agent/${chatId}?text=${text}`;

   try {
     const response = await fetch(url);

     if (!response.body) {
       console.error("No response body");
       return;
     }

     const reader = response.body.getReader();
     const decoder = new TextDecoder("utf-8");
   //   let fullText = "";

     while (true) {
       const { done, value } = await reader.read();
       if (done) break;

       const chunk = decoder.decode(value, { stream: true });
       onChunk(chunk);
      //  fullText += chunk;
      //  console.log(fullText);
     }

   //   console.log("Streaming complete");
   } catch (err) {
     console.error("Fetch stream error:", err);
   }
 };


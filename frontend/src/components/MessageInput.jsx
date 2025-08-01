import { useRef, useState } from "react"
import { useChatStore } from "../store/useChatStore";
import { Image, Loader, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [ text, setText ] = useState("");
  const [ imagePreview, setImagePreview ] = useState(null);
  const [ isSendingMessage, setIsSendingMessage ] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore()
  
  const handleImageChange = (e)=>{
    const file = e.target.files[0];
    if (!file) return;
  
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
  
    const reader = new FileReader();
    reader.readAsDataURL(file);
  
    reader.onload = async () => {
      const base64Image = reader.result;
      setImagePreview(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage =async (e)=>{
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    setIsSendingMessage(true);
    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview
      });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch(error){
      console.error("Failed to send messages:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2 relative">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="relative w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
          {isSendingMessage && <div className="absolute bg-neutral-300 bg-opacity-30 h-full w-20 flex justify-center items-center">
            <Loader className="size-5 animate-spin" />
          </div>}
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
        <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-circle border-0"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  )
}
export default MessageInput
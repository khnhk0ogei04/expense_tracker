import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { LuImage, LuX } from "react-icons/lu";

const EmojiPickerPopup = ({ icon, onSelect, onEmojiSelect }) => {
  const handleEmojiSelect = onEmojiSelect || onSelect;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-start gap-5 mb-6">
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-12 h-12 flex items-center justify-center text-2xl bg-purple-50 text-primary rounded-lg">
          {icon ? (
            icon.startsWith('http') ? (
              <img src={icon} alt="Icon" className="w-8 h-8" />
            ) : (
              <span className="text-2xl">{icon}</span>
            )
          ) : (
            <LuImage />
          )}
        </div>

        <p className="">{icon ? "Change Icon" : "Pick Icon"}</p>
      </div>

      {isOpen && (
        <div className="relative">
          <button
            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full absolute -top-2 -right-2 z-10 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <LuX />
          </button>
          
          <EmojiPicker
            open={isOpen}
            onEmojiClick={(emojiData) => {
              console.log('Emoji clicked:', emojiData);
              console.log('handleEmojiSelect:', handleEmojiSelect);
              if (handleEmojiSelect && typeof handleEmojiSelect === 'function') {
                console.log('Calling handleEmojiSelect with:', emojiData.emoji);
                handleEmojiSelect(emojiData.emoji);
              } else {
                console.error('handleEmojiSelect isnt a function:', typeof handleEmojiSelect);
              }
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerPopup;
// LaTEx section 1.1, section 1.2
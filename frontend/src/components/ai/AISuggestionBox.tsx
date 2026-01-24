import React, { useState } from 'react';
import { Sparkles, Check, X, Edit3, Loader2, RefreshCw } from 'lucide-react';

interface AISuggestionBoxProps {
  suggestion: string;
  fieldName: string;
  onUse: (text: string) => void;
  onDiscard: () => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
  isRegenerating?: boolean;
}

const AISuggestionBox: React.FC<AISuggestionBoxProps> = ({
  suggestion,
  fieldName,
  onUse,
  onDiscard,
  onRegenerate,
  isLoading = false,
  isRegenerating = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(suggestion);
  const [isDiscarded, setIsDiscarded] = useState(false);

  // Handle use as is
  const handleUseAsIs = () => {
    onUse(suggestion);
  };

  // Handle modify - enter edit mode
  const handleModify = () => {
    setIsEditing(true);
    setEditedText(suggestion);
  };

  // Handle save modified text
  const handleSaveModified = () => {
    onUse(editedText);
    setIsEditing(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText(suggestion);
  };

  // Handle discard
  const handleDiscard = () => {
    setIsDiscarded(true);
    onDiscard();
  };

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-luna-50 to-white border-2 border-luna-100 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-luna-100 rounded-lg flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-luna-300 animate-spin" />
          </div>
          <div>
            <span className="text-sm font-medium text-luna-300">AI is generating...</span>
            <p className="text-xs text-gray-500">Creating a tailored suggestion for {fieldName}</p>
          </div>
        </div>
      </div>
    );
  }

  // If discarded, show minimal state with option to bring back
  if (isDiscarded) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 italic">AI suggestion discarded</span>
          <button
            onClick={() => setIsDiscarded(false)}
            className="text-sm text-luna-300 hover:text-luna-400 font-medium"
          >
            Show again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-luna-50 to-white border-2 border-luna-100 rounded-xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-luna-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-luna-300" />
          </div>
          <span className="text-sm font-semibold text-luna-400">AI Suggestion</span>
        </div>
        
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-luna-300 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        // Edit mode
        <div className="mb-3">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-3 border-2 border-luna-200 rounded-lg resize-none focus:ring-2 focus:ring-luna-100 focus:border-luna-300 transition-all text-gray-700 min-h-[100px]"
            autoFocus
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleSaveModified}
              className="flex items-center gap-1 px-4 py-2 bg-luna-200 text-white rounded-lg text-sm font-medium hover:bg-luna-300 transition-colors"
            >
              <Check className="w-4 h-4" />
              Save & Use
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // View mode
        <>
          <p className="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
            {suggestion}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUseAsIs}
              className="flex items-center gap-1.5 px-4 py-2 bg-luna-200 text-white rounded-lg text-sm font-medium hover:bg-luna-300 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              Use as is
            </button>
            <button
              onClick={handleModify}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-luna-400 border-2 border-luna-200 rounded-lg text-sm font-medium hover:bg-luna-50 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Modify
            </button>
            <button
              onClick={handleDiscard}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Discard
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AISuggestionBox;

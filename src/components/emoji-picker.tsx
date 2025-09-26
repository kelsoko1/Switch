import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const EMOJI_CATEGORIES = [
  { name: 'Smileys & People', emojis: ['😀', '😊', '😍', '😂', '😎', '🥰', '😜', '🤔', '😴', '🥳'] },
  { name: 'Animals & Nature', emojis: ['🐶', '🐱', '🦁', '🐯', '🦒', '🐘', '🌳', '🌻', '🌞', '🌈'] },
  { name: 'Food & Drink', emojis: ['🍎', '🍕', '🍔', '🍟', '🍦', '🍩', '☕', '🍷', '🍺', '🍽️'] },
  { name: 'Activity', emojis: ['⚽', '🏀', '🎾', '🏓', '🎮', '🎲', '🎯', '🎨', '🎭', '🎤'] },
  { name: 'Travel & Places', emojis: ['🚗', '✈️', '🚢', '🚀', '🏠', '🏖️', '🗼', '🌋', '🏕️', '🌆'] },
  { name: 'Objects', emojis: ['⌚', '📱', '💻', '📷', '📚', '✏️', '✂️', '🔑', '💡', '📦'] },
  { name: 'Symbols', emojis: ['❤️', '👍', '👎', '🙏', '👌', '✌️', '🤞', '🤝', '💯', '🔝'] },
  { name: 'Flags', emojis: ['🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🇺🇳', '🇺🇸', '🇬🇧', '🇯🇵', '🇧🇷'] },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function EmojiPicker({ 
  onSelect, 
  children,
  className 
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Filter emojis based on search query
  const filteredEmojis = EMOJI_CATEGORIES.map(category => ({
    ...category,
    emojis: category.emojis.filter(emoji => 
      emoji.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.emojis.length > 0);
  
  // Handle emoji selection
  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
  };
  
  // Handle scroll to show active category
  const handleScroll = () => {
    if (!contentRef.current || !categoryRefs.current.length) return;
    
    const scrollTop = contentRef.current.scrollTop;
    const containerTop = contentRef.current.getBoundingClientRect().top;
    
    // Find which category is currently in view
    for (let i = 0; i < categoryRefs.current.length; i++) {
      const ref = categoryRefs.current[i];
      if (!ref) continue;
      
      const rect = ref.getBoundingClientRect();
      const isInView = rect.top <= containerTop + 50 && rect.bottom >= containerTop + 50;
      
      if (isInView) {
        setActiveCategory(i);
        break;
      }
    }
  };
  
  // Scroll to selected category
  const scrollToCategory = (index: number) => {
    if (categoryRefs.current[index]) {
      categoryRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Add scroll event listener
  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', handleScroll);
      return () => content.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Reset search and active category when opening/closing
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveCategory(0);
    }
  }, [isOpen]);
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 rounded-full", className)}
          >
            <Icons.smile className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[320px] p-0 overflow-hidden"
        align="start"
        sideOffset={4}
      >
        <div className="p-2 border-b">
          <div className="relative">
            <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search emojis..."
              className="w-full pl-8 pr-3 py-2 text-sm bg-transparent outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery('')}
              >
                <Icons.x className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex h-[300px] overflow-hidden">
          {/* Category sidebar */}
          <div className="w-10 border-r flex flex-col items-center py-2 space-y-1 overflow-y-auto">
            {filteredEmojis.map((category, index) => (
              <button
                key={category.name}
                type="button"
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-md',
                  activeCategory === index 
                    ? 'bg-muted text-foreground' 
                    : 'text-muted-foreground hover:bg-muted/50'
                )}
                onClick={() => scrollToCategory(index)}
                title={category.name}
              >
                {category.emojis[0]}
              </button>
            ))}
          </div>
          
          {/* Emoji grid */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto p-2"
          >
            {filteredEmojis.length > 0 ? (
              filteredEmojis.map((category, catIndex) => (
                <div 
                  key={category.name}
                  ref={el => categoryRefs.current[catIndex] = el}
                  className="mb-4"
                >
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 px-1">
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-8 gap-1">
                    {category.emojis.map((emoji, emojiIndex) => (
                      <button
                        key={`${catIndex}-${emojiIndex}`}
                        type="button"
                        className="text-2xl p-1 rounded-md hover:bg-muted transition-colors"
                        onClick={() => handleSelect(emoji)}
                        title={category.name}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Icons.searchX className="h-8 w-8 mb-2" />
                <p className="text-sm">No emojis found</p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

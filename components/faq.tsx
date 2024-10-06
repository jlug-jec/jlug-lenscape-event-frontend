import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQItem = ({ item, isOpen, toggleOpen }: { item: FAQItem, isOpen: boolean, toggleOpen: () => void }) => {
  return (
    <motion.div
      className="border-b bg-slate-300 border-gray-200 last:border-none z-[999]"
      initial={false}
      animate={{ backgroundColor: isOpen ? "rgba(59, 130, 246, 0.05)" : "transparent" }}
      transition={{ duration: 0.3 }}
    >
      <button
        className="flex justify-between items-center w-full text-left px-6 py-4"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-gray-800">{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-blue-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto", marginBottom: 16 },
              collapsed: { opacity: 0, height: 0, marginBottom: 0 }
            }}
            transition={{ duration: 0.3 }}
            className="px-6"
          >
            <p className="text-gray-600 leading-relaxed">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const FAQPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = [
    {
      question: "What is LENSCAPE 2024?",
      answer: "LENSCAPE 2024 is the premier photography event of the year organized by the JEC Linux User's Group (JEC LUG)."
    },
    {
      question: "When and where will LENSCAPE 2024 take place?",
      answer: "LENSCAPE 2024 is scheduled for October and will be conducted as an online event."
    },
    {
      question: "How can I register for LENSCAPE 2024?",
      answer: "You can register for LENSCAPE 2024 through our official website."
    },
    {
      question: "What types of activities and events can I expect?",
      answer: "LENSCAPE invites participants to showcase their creativity through photography, digital art, or cinematography. Let your lens capture the world and share your creations with us!"
    },
    {
      question: "Is there any college restriction for participating?",
      answer: "No, LENSCAPE 2024 is open to all photography and digital art enthusiasts, regardless of their college."
    },
    {
      question: "Are there any restrictions on the type of links for submissions?",
      answer: "Yes, only Google Drive links (with public access) or YouTube public/unlisted links are accepted for submissions."
    }
  ];
  

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="text-white/80 hover:text-white font-medium bg-transparent
                                        flex items-center gap-2 hover:shadow-xl transition-all duration-300"
      >
      
        Frequently Asked Questions  <span className="text-lg">→</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed inset-4 md:inset-10 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[9999]"
            >
              <div className="p-6 bg-gradient-to-r from-violet-500 to-indigo-600 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  Frequently Asked Questions
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="py-4">
                  {faqData.map((item, index) => (
                    <FAQItem
                      key={index}
                      item={item}
                      isOpen={index === openIndex}
                      toggleOpen={() => setOpenIndex(index === openIndex ? null : index)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FAQPopup;
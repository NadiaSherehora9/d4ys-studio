import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Як записатися на пробне заняття?",
    answer:
      "Записатися на пробне заняття можна через наш Instagram @d4ys_studio або зателефонувавши нам. Пробне заняття коштує 150 грн і дозволяє вам обрати будь-який напрямок для ознайомлення.",
  },
  {
    question: "Чи потрібен попередній досвід для занять?",
    answer:
      "Ні, попередній досвід не потрібен! Ми маємо групи для різних рівнів підготовки — від початківців до просунутих танцюристів. Наші тренери допоможуть вам розвиватися з будь-якого рівня.",
  },
  {
    question: "Який одяг потрібен для занять?",
    answer:
      "Рекомендуємо зручний спортивний одяг, який не обмежує рухи. Для Choreo підійдуть кросівки або джазівки, для Jazz-Funk — зручне взуття на невеликому підборі. Головне — комфорт!",
  },

  {
    question: "Скільки людей у групі?",
    answer:
      "Ми підтримуємо комфортний розмір груп — до 15 осіб. Це дозволяє тренеру приділяти увагу кожному учаснику та забезпечувати якісне навчання.",
  },
  {
    question: "Чи є заняття для дітей?",
    answer:
      "Так, ми маємо дитячі групи для різних вікових категорій. Діти можуть займатися Choreo та Jazz-Funk. Розклад дитячих груп можна дізнатися у нас в Instagram.",
  },
  {
    question: "Як оплатити заняття?",
    answer:
      "Оплата можлива готівкою в студії або переказом на картку. Абонементи оплачуються на початку періоду. Разові заняття — перед початком тренування.",
  },
  {
    question: "Де знаходиться студія?",
    answer:
      "Студія D4YS розташована в центрі Білої Церкви. Точну адресу та схему проїзду можна отримати після запису на заняття або в нашому Instagram.",
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-[150px] opacity-10"
          style={{ background: "hsl(var(--primary))" }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-24"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-6"
          >
            FAQ
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase mb-6">
            Часті{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
              питання
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
            Відповіді на популярні запитання про студію, розклад та умови
            занять.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <motion.div
                className={`border rounded-xl overflow-hidden transition-colors duration-300 ${
                  openIndex === index
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/50 bg-card/30 hover:border-primary/30"
                }`}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-bold text-sm sm:text-base pr-4">
                    {item.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      openIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/10 text-foreground"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-5 pb-5">
                        <motion.p
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="text-muted-foreground text-sm leading-relaxed"
                        >
                          {item.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Send, Check, AlertCircle, Instagram, MapPin, Phone, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Ім'я повинно містити мінімум 2 символи" })
    .max(50, { message: "Ім'я повинно бути менше 50 символів" }),
  email: z
    .string()
    .trim()
    .email({ message: "Невірний формат email" })
    .max(100, { message: "Email повинен бути менше 100 символів" }),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s+()-]+$/, { message: "Невірний формат телефону" })
    .min(10, { message: "Телефон повинен містити мінімум 10 цифр" })
    .max(20, { message: "Телефон повинен бути менше 20 символів" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Повідомлення повинно містити мінімум 10 символів" })
    .max(500, { message: "Повідомлення повинно бути менше 500 символів" }),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (supabase) {
        const { error } = await supabase.from("bookings").insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          status: "pending",
          notes: `${formData.message}\nДжерело: Контактна форма`,
        });

        if (error) {
          throw error;
        }

        // TODO: Trigger email notification to gglutt9@gmail.com
        // This would typically be done via Supabase Edge Function or Database Webhook
        console.log(`[Notification] New lead from ${formData.email}. Sending notification to gglutt9@gmail.com`);
        
        await sendTelegramMessage(`<b>🔥 Нове повідомлення (Контакти)</b>\n\n<b>👤 Ім'я:</b> ${formData.name}\n<b>📞 Телефон:</b> ${formData.phone}\n<b>✉️ Email:</b> ${formData.email}\n\n<b>💬 Повідомлення:</b>\n${formData.message}`);
        
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setFormData({ name: "", email: "", phone: "", message: "" });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to submit contact form", error);
      setIsSubmitting(false);
      setFormError("Не вдалося надіслати форму. Спробуйте ще раз або напишіть в Instagram.");
    }
  };

  const inputClasses = (field: keyof FormErrors) =>
    `w-full px-4 py-3 bg-card/50 border rounded-xl text-foreground placeholder:text-muted-foreground/50 transition-all duration-300 outline-none ${
      errors[field]
        ? "border-red-500/50 focus:border-red-500"
        : focusedField === field
        ? "border-primary/50 bg-primary/5"
        : "border-border/50 hover:border-primary/30 focus:border-primary/50"
    }`;

  return (
    <section id="contact" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full blur-[150px] opacity-10"
          style={{ background: "hsl(var(--primary))" }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{ duration: 8, repeat: Infinity }}
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
            Контакти
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase mb-6">
            Зв'яжіться з <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">нами</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
            Маєте питання? Напишіть нам, і ми з радістю відповімо!
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Контактна інформація</h3>
              <p className="text-muted-foreground text-sm">
                Зв'яжіться з нами будь-яким зручним способом
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              <motion.a
                href="https://www.instagram.com/d4ys_studio/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center gap-4 p-4 bg-card/50 border border-border/50 rounded-xl hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Instagram</p>
                  <p className="text-muted-foreground text-sm">@d4ys_studio</p>
                </div>
              </motion.a>

              <motion.a
                href="mailto:gglutt9@gmail.com"
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center gap-4 p-4 bg-card/50 border border-border/50 rounded-xl hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Email</p>
                  <p className="text-muted-foreground text-sm">gglutt9@gmail.com</p>
                </div>
              </motion.a>

              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center gap-4 p-4 bg-card/50 border border-border/50 rounded-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Локація</p>
                  <p className="text-muted-foreground text-sm">Біла Церква, Україна</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center gap-4 p-4 bg-card/50 border border-border/50 rounded-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Телефон</p>
                  <p className="text-muted-foreground text-sm">Напишіть в Instagram</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="relative p-6 sm:p-8 bg-card/30 border border-border/50 rounded-2xl backdrop-blur-sm">
              {/* Success Overlay */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </motion.div>
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg font-bold"
                    >
                      Повідомлення надіслано!
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-muted-foreground text-sm"
                    >
                      Ми зв'яжемося з вами найближчим часом
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ім'я <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Ваше ім'я"
                    className={inputClasses("name")}
                    maxLength={50}
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mt-2 text-xs text-red-500 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email & Phone Fields */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email <span className="text-primary">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="your@email.com"
                      className={inputClasses("email")}
                      maxLength={100}
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-2 text-xs text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Телефон <span className="text-primary">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="+380 XX XXX XX XX"
                      className={inputClasses("phone")}
                      maxLength={20}
                    />
                    <AnimatePresence>
                      {errors.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-2 text-xs text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {errors.phone}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Повідомлення <span className="text-primary">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Ваше повідомлення..."
                    rows={4}
                    className={`${inputClasses("message")} resize-none`}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <AnimatePresence>
                      {errors.message && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-xs text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {errors.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formData.message.length}/500
                    </span>
                  </div>
                </div>

                {formError && (
                  <p className="text-sm text-red-500">
                    {formError}
                  </p>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        НАДСИЛАННЯ...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        НАДІСЛАТИ
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

import { useState, useEffect } from 'react';

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isCaptchaValid) {
      setErrorMessage("Please complete the Human Verification correctly.");
      return;
    }

    const lastSent = localStorage.getItem('lastMessageSent');
    if (lastSent && Date.now() - parseInt(lastSent) < 60000 * 30) {
      setErrorMessage("You have already sent a message recently. Please try again later.");
      return;
    }

    const form = e.currentTarget;
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(form);
    
    try {
      const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT || "https://formspree.io/f/mnjjabjz";
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setIsSuccess(true);
        form.reset();
        localStorage.setItem('lastMessageSent', Date.now().toString());
      } else {
        const data = await response.json();
        if (Object.prototype.hasOwnProperty.call(data, 'errors')) {
           setErrorMessage(data["errors"].map((error: any) => error["message"]).join(", "));
        } else {
           setErrorMessage("Oops! There was a problem submitting your form. Please try again.");
        }
      }
    } catch (error) {
      setErrorMessage("Oops! There was a network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    isSuccess,
    errorMessage,
    setIsCaptchaValid,
    submitForm,
    closeSuccessMessage: () => setIsSuccess(false)
  };
};

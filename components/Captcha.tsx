import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface CaptchaProps {
  onValidate: (isValid: boolean) => void;
}

export const Captcha: React.FC<CaptchaProps> = ({ onValidate }) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const handleChange = (value: string | null) => {
    // If value is a non-empty string, verification is successful
    onValidate(!!value);
  };

  if (!siteKey) {
    console.error('reCAPTCHA site key is missing in environment variables.');
    return (
      <div className="text-error text-sm p-4 bg-error-container/20 rounded-lg">
        Error: reCAPTCHA is not configured.
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-4 w-full">
      <ReCAPTCHA
        sitekey={siteKey}
        onChange={handleChange}
        theme="light" // You could also try making this dynamic if you have a dark mode
      />
    </div>
  );
};

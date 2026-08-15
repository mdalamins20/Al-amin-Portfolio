export const saveEmailJSKeys = (serviceId: string, templateId: string, publicKey: string) => {
  localStorage.setItem('emailjs_service_id', serviceId);
  localStorage.setItem('emailjs_template_id', templateId);
  localStorage.setItem('emailjs_public_key', publicKey);
};

export const getEmailJSKeys = () => {
  return {
    serviceId: localStorage.getItem('emailjs_service_id') || '',
    templateId: localStorage.getItem('emailjs_template_id') || '',
    publicKey: localStorage.getItem('emailjs_public_key') || '',
  };
};

export const hasEmailJSKeys = () => {
  const keys = getEmailJSKeys();
  return Boolean(keys.serviceId && keys.templateId && keys.publicKey);
};

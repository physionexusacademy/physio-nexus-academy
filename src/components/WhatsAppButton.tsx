export function WhatsAppButton() {
  const whatsappUrl =
    "https://wa.me/923489009028?text=Hello%20Physio%20Nexus%20Academy%2C%20I%20would%20like%20to%20know%20more.";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Physio Nexus Academy on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-24 right-3 z-[70] inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition duration-200 hover:scale-105 hover:bg-[#20bd5a] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/30 sm:bottom-24 sm:right-5 sm:h-14 sm:w-14 lg:bottom-6 lg:right-6"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-7 w-7 fill-current sm:h-8 sm:w-8"
      >
        <path d="M16.04 3C8.86 3 3.02 8.8 3.02 15.94c0 2.28.6 4.5 1.74 6.45L3 29l6.8-1.78a13.1 13.1 0 0 0 6.23 1.58h.01c7.17 0 13.01-5.8 13.01-12.94C29.05 8.8 23.21 3 16.04 3Zm0 23.62h-.01a10.9 10.9 0 0 1-5.56-1.52l-.4-.23-4.03 1.05 1.08-3.92-.26-.4a10.7 10.7 0 0 1-1.66-5.66c0-5.94 4.87-10.77 10.85-10.77 5.98 0 10.84 4.83 10.84 10.77 0 5.95-4.87 10.78-10.85 10.78Zm5.95-8.07c-.33-.16-1.94-.95-2.24-1.06-.3-.11-.52-.16-.74.16-.22.33-.85 1.06-1.04 1.28-.19.22-.38.25-.7.08-.33-.16-1.37-.5-2.62-1.6a9.78 9.78 0 0 1-1.81-2.24c-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.54.11-.22.05-.41-.03-.57-.08-.16-.74-1.78-1.01-2.44-.27-.64-.54-.56-.74-.57h-.63c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.71 0 1.6 1.17 3.15 1.33 3.36.16.22 2.3 3.49 5.56 4.89.78.33 1.38.53 1.85.68.78.25 1.49.21 2.05.13.63-.09 1.94-.79 2.21-1.55.27-.76.27-1.41.19-1.55-.08-.14-.3-.22-.63-.38Z" />
      </svg>
    </a>
  );
}

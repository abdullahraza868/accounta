import { Toaster as Sonner } from "sonner@2.0.3";

const Toaster = () => {
  return (
    <Sonner
      position="top-right"
      className="toaster group"
      offset={80}
      toastOptions={{
        classNames: {
          toast: 'bg-white border-gray-200 shadow-lg',
          title: 'text-gray-900',
          description: 'text-gray-500',
          actionButton: 'bg-purple-600 text-white',
          cancelButton: 'bg-gray-100 text-gray-900',
        },
      }}
    />
  );
};

export { Toaster };
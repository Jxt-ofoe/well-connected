import './globals.css';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Well Connected — Premium Provisions Store',
  description: 'Your one-stop shop for quality groceries, household essentials, and everyday provisions. Fast delivery, best prices.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1a1a1a',
                  color: '#f5f5f5',
                  border: '1px solid #2a2a2a',
                  borderRadius: '10px',
                },
                success: {
                  iconTheme: { primary: '#d4a843', secondary: '#0a0a0a' },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

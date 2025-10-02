import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 opacity-0 animate-[fade-in_0.5s_ease-out_0.5s_forwards]">
            Switch
          </h1>
          <p className="text-white/80 h-6 overflow-hidden">
            <span className="inline-block animate-[slide-up_0.5s_ease-out_1s_forwards] opacity-0">
              Connect.
            </span>{' '}
            <span className="inline-block animate-[slide-up_0.5s_ease-out_1.5s_forwards] opacity-0">
              Stream.
            </span>{' '}
            <span className="inline-block animate-[slide-up_0.5s_ease-out_2s_forwards] opacity-0">
              Pay.
            </span>{' '}
            <span className="inline-block animate-[slide-up_0.5s_ease-out_2.5s_forwards] opacity-0">
              All in one place.
            </span>
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-xl p-6 opacity-0 animate-[fade-in_0.5s_ease-out_3s_forwards] transform translate-y-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
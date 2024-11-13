import React from 'react';
import EmployerHeader from './EmployerHeader';
import Footer from '../../../applicants/components/layout/Footer';

const EmployerLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <EmployerHeader />
      <main className="flex-grow bg-gray-100">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default EmployerLayout;
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import SearchInput from './SearchInput';

const PaymentSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Card className="bg-dashboard-card border-dashboard-accent1/20 rounded-lg mb-6">
      <div className="p-6">
        <h2 className="text-xl font-medium text-white mb-4">Payment Search</h2>
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>
    </Card>
  );
};

export default PaymentSearch;
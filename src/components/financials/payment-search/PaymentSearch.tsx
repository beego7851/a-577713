import React from 'react';
import { Card } from "@/components/ui/card";
import SearchInput from './SearchInput';

const PaymentSearch = () => {
  return (
    <Card className="bg-dashboard-card border-dashboard-accent1/20 rounded-lg mb-6">
      <div className="p-6">
        <h2 className="text-xl font-medium text-white mb-4">Payment Search</h2>
        <SearchInput />
      </div>
    </Card>
  );
};

export default PaymentSearch;
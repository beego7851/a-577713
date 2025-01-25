import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SearchInput from './SearchInput';
import PaymentDetailsCard from './PaymentDetailsCard';
import { toast } from '@/hooks/use-toast';

const PaymentSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: payment, isLoading } = useQuery({
    queryKey: ['payment-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return null;

      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          members:member_id (
            full_name,
            email,
            member_number
          ),
          collector:collector_id (
            name,
            email
          ),
          receipt:payment_receipts (
            receipt_number,
            sent_at,
            sent_to
          )
        `)
        .eq('payment_number', searchTerm)
        .single();

      if (error) {
        console.error('Error fetching payment:', error);
        toast({
          title: "Error",
          description: "Failed to fetch payment details",
          variant: "destructive",
        });
        return null;
      }

      return data;
    },
    enabled: searchTerm.length > 0,
  });

  return (
    <div className="space-y-6">
      <SearchInput 
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <PaymentDetailsCard 
        payment={payment}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PaymentSearch;
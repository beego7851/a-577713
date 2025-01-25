import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import TotalCount from "@/components/TotalCount";

const PaymentTrackingSection = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['payment-tracking'],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

      const { data, error } = await supabase
        .from('payment_requests')
        .select('amount, status, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const totalAmount = data.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const approvedPayments = data.filter(p => p.status === 'approved').length;
      const pendingPayments = data.filter(p => p.status === 'pending').length;
      const totalPayments = data.length;

      return {
        totalAmount,
        approvedPayments,
        pendingPayments,
        totalPayments
      };
    }
  });

  if (isLoading) {
    return (
      <Card className="p-4 bg-dashboard-card border-dashboard-accent1/20">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-dashboard-accent1" />
          <span className="text-dashboard-text">Loading payment statistics...</span>
        </div>
      </Card>
    );
  }

  const items = [
    {
      count: stats?.totalPayments || 0,
      label: "Total Payments (30 days)",
      icon: <CreditCard className="h-5 w-5 text-dashboard-accent1" />
    },
    {
      count: stats?.approvedPayments || 0,
      label: "Approved Payments",
      icon: <TrendingUp className="h-5 w-5 text-dashboard-accent3" />
    },
    {
      count: stats?.pendingPayments || 0,
      label: "Pending Payments",
      icon: <TrendingDown className="h-5 w-5 text-dashboard-warning" />
    },
    {
      count: `£${stats?.totalAmount?.toFixed(2) || '0.00'}`,
      label: "Total Amount",
      icon: <CreditCard className="h-5 w-5 text-dashboard-accent2" />
    }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-white mb-4">Payment Tracking (Last 30 Days)</h3>
      <TotalCount items={items} />
    </div>
  );
};

export default PaymentTrackingSection;
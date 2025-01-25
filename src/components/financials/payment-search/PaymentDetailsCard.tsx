import React from 'react';
import { Card } from "@/components/ui/card";
import { AlertCircle, Calendar, Check, CreditCard, Mail, User, XOctagon } from 'lucide-react';
import { formatDate } from '@/lib/dateFormat';

interface PaymentDetailsCardProps {
  payment: any | null;
  isLoading: boolean;
}

const PaymentDetailsCard = ({ payment, isLoading }: PaymentDetailsCardProps) => {
  if (isLoading) {
    return (
      <Card className="p-6 bg-dashboard-card border-white/10">
        <div className="animate-pulse flex space-y-4 flex-col">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (!payment) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-5 w-5" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5" />;
      case 'rejected':
        return <XOctagon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 bg-dashboard-card border-white/10">
      <div className="space-y-6">
        {/* Payment Basic Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-dashboard-text">Reference: {payment.payment_number}</p>
              <p className="text-dashboard-text">Amount: £{payment.amount}</p>
              <p className="text-dashboard-text flex items-center gap-2">
                Status: 
                <span className={`flex items-center gap-1 ${getStatusColor(payment.status)}`}>
                  {getStatusIcon(payment.status)}
                  {payment.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-dashboard-text flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created: {formatDate(payment.created_at)}
              </p>
              {payment.approved_at && (
                <p className="text-dashboard-text flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Approved: {formatDate(payment.approved_at)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Member Info */}
        <div>
          <h4 className="text-md font-semibold mb-3 text-white">Member Information</h4>
          <div className="space-y-2">
            <p className="text-dashboard-text flex items-center gap-2">
              <User className="h-4 w-4" />
              {payment.members?.full_name} ({payment.members?.member_number})
            </p>
            <p className="text-dashboard-text flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {payment.members?.email}
            </p>
          </div>
        </div>

        {/* Collector Info */}
        <div>
          <h4 className="text-md font-semibold mb-3 text-white">Collector Information</h4>
          <div className="space-y-2">
            <p className="text-dashboard-text flex items-center gap-2">
              <User className="h-4 w-4" />
              {payment.collector?.name}
            </p>
            <p className="text-dashboard-text flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {payment.collector?.email}
            </p>
          </div>
        </div>

        {/* Receipt & Email Info */}
        {payment.receipt && (
          <div>
            <h4 className="text-md font-semibold mb-3 text-white">Receipt Information</h4>
            <div className="space-y-2">
              <p className="text-dashboard-text flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Receipt: {payment.receipt.receipt_number}
              </p>
              <p className="text-dashboard-text flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Sent: {formatDate(payment.receipt.sent_at)}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentDetailsCard;
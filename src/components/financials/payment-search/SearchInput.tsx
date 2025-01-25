import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by payment reference (e.g. PAY000123)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 bg-dashboard-card border-white/10 focus:border-white/20"
        />
      </div>
    </div>
  );
};

export default SearchInput;
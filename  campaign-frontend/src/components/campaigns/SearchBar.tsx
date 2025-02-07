import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onStatusFilter: (status: string) => void;
  onPayoutFilter: (amount: string) => void;
  onSortBy: (criteria: string) => void;
}

export const SearchBar = ({ onSearch, onStatusFilter, onPayoutFilter, onSortBy }: SearchBarProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search campaigns..."
          className="pl-8"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Select onValueChange={onStatusFilter} defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="true">Running</SelectItem>
          <SelectItem value="false">Stopped</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={onPayoutFilter} defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Payout Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payouts</SelectItem>
          <SelectItem value="0-50">$0 - $50</SelectItem>
          <SelectItem value="51-100">$51 - $100</SelectItem>
          <SelectItem value="101-500">$101 - $500</SelectItem>
          <SelectItem value="501+">$501+</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={onSortBy} defaultValue="newest">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="title-asc">Title A-Z</SelectItem>
          <SelectItem value="title-desc">Title Z-A</SelectItem>
          <SelectItem value="payout-high">Highest Payout</SelectItem>
          <SelectItem value="payout-low">Lowest Payout</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
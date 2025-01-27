import { Card } from "@/components/ui/card";
import { Users, ChevronDown, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { formatDate } from "@/lib/dateFormat";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface FamilyMemberCardProps {
  id: string;
  name: string | null;
  relationship: string | null;
  dob: string | null;
  gender: string | null;
  memberNumber: string | null;
  onDelete: (id: string) => void;
}

const FamilyMemberCard = ({ id, name, relationship, dob, gender, memberNumber, onDelete }: FamilyMemberCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!name && !relationship && !dob && !gender) {
    return null;
  }

  // Determine background color and icon color based on relationship and gender
  const getStyles = () => {
    if (relationship === 'spouse') {
      return {
        bg: 'bg-[#E5DEFF]',
        border: 'border-[#7E69AB]/20 hover:border-[#7E69AB]/40',
        icon: 'bg-[#7E69AB]/10 text-[#7E69AB]'
      };
    }
    if (relationship === 'dependant') {
      return gender === 'male' 
        ? {
            bg: 'bg-[#D3E4FD]',
            border: 'border-[#0EA5E9]/20 hover:border-[#0EA5E9]/40',
            icon: 'bg-[#0EA5E9]/10 text-[#0EA5E9]'
          }
        : {
            bg: 'bg-[#FFDEE2]',
            border: 'border-[#D946EF]/20 hover:border-[#D946EF]/40',
            icon: 'bg-[#D946EF]/10 text-[#D946EF]'
          };
    }
    return {
      bg: 'bg-[#F2FCE2]',
      border: 'border-[#7EBF8E]/20 hover:border-[#7EBF8E]/40',
      icon: 'bg-[#7EBF8E]/10 text-[#7EBF8E]'
    };
  };

  const styles = getStyles();

  const handleDelete = async () => {
    try {
      onDelete(id);
      toast.success("Family member removed successfully");
    } catch (error) {
      console.error("Error deleting family member:", error);
      toast.error("Failed to remove family member");
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className={`p-4 ${styles.bg} ${styles.border} transition-all duration-300`}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${styles.icon}`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-[#1A1F2C]">{name}</h3>
                <p className="text-sm text-[#403E43] capitalize">{relationship}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <CollapsibleTrigger>
                <ChevronDown className={`w-5 h-5 text-[#403E43] transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent className="mt-4">
            <Table>
              <TableBody>
                {memberNumber && (
                  <TableRow className="border-b border-[#0EA5E9]/10">
                    <TableCell className="py-2 text-[#1A1F2C] font-medium">Member Number</TableCell>
                    <TableCell className="py-2">
                      <span className="px-2 py-1 rounded-md bg-[#9B87F5]/10 text-[#9B87F5] font-medium">
                        {memberNumber}
                      </span>
                    </TableCell>
                  </TableRow>
                )}
                
                {relationship && (
                  <TableRow className="border-b border-[#0EA5E9]/10">
                    <TableCell className="py-2 text-[#1A1F2C] font-medium">Relationship</TableCell>
                    <TableCell className="py-2 text-[#403E43] capitalize">{relationship}</TableCell>
                  </TableRow>
                )}
                
                {dob && (
                  <TableRow className="border-b border-[#0EA5E9]/10">
                    <TableCell className="py-2 text-[#1A1F2C] font-medium">Date of Birth</TableCell>
                    <TableCell className="py-2 text-[#403E43]">{formatDate(dob)}</TableCell>
                  </TableRow>
                )}
                
                {gender && (
                  <TableRow className="border-b border-[#0EA5E9]/10">
                    <TableCell className="py-2 text-[#1A1F2C] font-medium">Gender</TableCell>
                    <TableCell className="py-2 text-[#403E43] capitalize">{gender}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {name} from your family members list.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FamilyMemberCard;
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CheckIcon, PlusCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useGetWorkspaceMembersQuery,
  useSearchWorkspaceMembersQuery,
  WorkspaceMember,
} from '@/store/workspaceApi';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';

interface MemberSelectorProps {
  workspaceId: number;
  selectedMemberIds: number[];
  onChange: (memberIds: number[]) => void;
  disabled?: boolean;
}

const MemberSelector = ({
  workspaceId,
  selectedMemberIds,
  onChange,
  disabled = false,
}: MemberSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Use the search endpoint when there's a query, otherwise use the regular endpoint
  const useSearchQuery = debouncedQuery.length > 0;

  const {
    data: membersResponse,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useGetWorkspaceMembersQuery(workspaceId, {
    skip: !workspaceId || isNaN(workspaceId) || useSearchQuery,
  });

  const {
    data: searchResponse,
    isLoading: isLoadingSearch,
    error: errorSearch,
  } = useSearchWorkspaceMembersQuery(
    { workspaceId, query: debouncedQuery },
    {
      skip: !workspaceId || isNaN(workspaceId) || !useSearchQuery,
    }
  );

  // Determine which data set to use
  const data = useSearchQuery ? searchResponse : membersResponse;
  const isLoading = useSearchQuery ? isLoadingSearch : isLoadingAll;
  const error = useSearchQuery ? errorSearch : errorAll;

  // Initialize with an empty array
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching workspace members:', error);
    }
  }, [error]);

  useEffect(() => {
    if (data?.status === 'success' && Array.isArray(data.data)) {
      setMembers(data.data);
    } else {
      setMembers([]);
    }
  }, [data]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const toggleMember = (memberId: number) => {
    onChange(
      selectedMemberIds.includes(memberId)
        ? selectedMemberIds.filter((id) => id !== memberId)
        : [...selectedMemberIds, memberId]
    );
  };

  const removeMember = (e: React.MouseEvent, memberId: number) => {
    e.stopPropagation();
    onChange(selectedMemberIds.filter((id) => id !== memberId));
  };

  // Get user info for the selected members
  const getSelectedMemberDetails = (memberId: number) => {
    const member = members.find((m) => m.id === memberId);
    return member || null;
  };

  const getAvatarInitial = (member: WorkspaceMember | null) => {
    if (!member) return '?';

    if (member.user?.name) {
      return member.user.name.charAt(0).toUpperCase();
    }

    if (member.id !== undefined && member.id !== null) {
      return String(member.id).charAt(0);
    }

    return '?';
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedMemberIds.map((memberId) => {
          const member = getSelectedMemberDetails(memberId);
          if (!member) return null;
          return (
            <Badge
              key={memberId}
              variant="secondary"
              className="flex items-center gap-1.5 py-1 pl-1 pr-2"
            >
              <Avatar className="h-5 w-5">
                {member.user?.image ? (
                  <AvatarImage
                    src={member.user.image}
                    alt={member.user?.name || 'User'}
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <AvatarFallback className="text-xs">
                    {getAvatarInitial(member)}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-xs">
                {member.user?.name || `Member ${member.id}`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={(e) => removeMember(e, memberId)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
      </div>
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-sm justify-start"
            disabled={disabled}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Assign members
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-64" align="start" side="bottom">
          <div className="flex flex-col">
            <div className="border-b p-2">
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none focus:outline-none text-sm bg-transparent"
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading members...</span>
                </div>
              ) : error ? (
                <div className="p-2 text-sm text-destructive">
                  Error loading members
                </div>
              ) : (
                <div className="py-1">
                  {members.map((member) => {
                    if (!member || member.id === undefined) return null;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => toggleMember(member.id)}
                      >
                        <Avatar className="h-6 w-6 mr-2">
                          {member.user?.image ? (
                            <AvatarImage
                              src={member.user.image}
                              alt={member.user?.name || `Member ${member.id}`}
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <AvatarFallback>
                              {getAvatarInitial(member)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="flex-grow">
                          {member.user?.name || `Member ${member.id}`}
                        </span>
                        {selectedMemberIds.includes(member.id) && (
                          <CheckIcon className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    );
                  })}

                  {members.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No members found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MemberSelector;

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useRouter } from "@tanstack/react-router";
import { Row } from "@tanstack/react-table";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onEdit?: (input: TData) => void;
  onDelete?: (id: number) => void;
  onSelect?: (id: number) => void;
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            router.navigate({
              to: `/pay/${row.original.id}`,
            })
          }
        >
          View
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />
        {/* @ts-expect-error TODO: fix this */}
        <DropdownMenuItem onClick={() => onDelete?.(row.original.id)}>
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
